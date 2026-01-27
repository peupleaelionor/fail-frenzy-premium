# Fail Frenzy: The Loop - Testing & QA Guide

## 🎯 TESTING STRATEGY

### Test Pyramid
```
         Manual/Exploratory
        ╱                    ╲
       ╱   Integration Tests  ╲
      ╱                        ╲
     ╱      Unit Tests          ╲
    ╱________________________________╲
```

---

## 1. UNIT TESTING

### Test Framework
- **Framework**: NUnit (C#) / Jest (TypeScript)
- **Coverage Target**: 80%+
- **Execution**: Pre-commit hooks

### Core Systems to Test

#### GameManager Tests
```csharp
[TestFixture]
public class GameManagerTests
{
    private GameManager _gameManager;
    private EventBus _eventBus;

    [SetUp]
    public void Setup()
    {
        _gameManager = new GameManager();
        _eventBus = new EventBus();
    }

    [Test]
    public void ChangeGameState_UpdatesCurrentState()
    {
        _gameManager.ChangeGameState(GameManager.GameState.Playing);
        Assert.AreEqual(GameManager.GameState.Playing, _gameManager.CurrentState);
    }

    [Test]
    public void RegisterSystem_MakesSystemAccessible()
    {
        var system = new InputHandler();
        _gameManager.RegisterSystem(system);
        Assert.IsNotNull(_gameManager.GetSystem<InputHandler>());
    }

    [Test]
    public void GetSystem_ReturnsCorrectSystemType()
    {
        var inputHandler = _gameManager.GetSystem<InputHandler>();
        Assert.IsInstanceOf<InputHandler>(inputHandler);
    }
}
```

#### DifficultyManager Tests
```csharp
[TestFixture]
public class DifficultyManagerTests
{
    private DifficultyManager _difficultyManager;

    [SetUp]
    public void Setup()
    {
        _difficultyManager = new DifficultyManager();
    }

    [Test]
    [TestCase(0.9f, 0.05f)] // High success rate should increase difficulty
    [TestCase(0.1f, -0.05f)] // Low success rate should decrease difficulty
    public void AdjustDifficulty_CorrectlyModifiesDifficulty(float successRate, float expectedChange)
    {
        var initialDifficulty = _difficultyManager.GetCurrentDifficulty();
        var metrics = new DifficultyManager.PerformanceMetrics { SuccessRate = successRate };
        
        _difficultyManager.AdjustDifficulty(metrics);
        
        var newDifficulty = _difficultyManager.GetCurrentDifficulty();
        Assert.IsTrue(Mathf.Abs(newDifficulty - initialDifficulty) > 0);
    }

    [Test]
    public void DifficultyStaysWithinBounds()
    {
        for (int i = 0; i < 100; i++)
        {
            var difficulty = _difficultyManager.GetCurrentDifficulty();
            Assert.IsTrue(difficulty >= 0.2f && difficulty <= 1.0f);
        }
    }
}
```

#### FailStreakManager Tests
```csharp
[TestFixture]
public class FailStreakManagerTests
{
    private FailStreakManager _failStreakManager;
    private EventBus _eventBus;

    [SetUp]
    public void Setup()
    {
        _eventBus = new EventBus();
        _failStreakManager = new FailStreakManager();
        _failStreakManager.Initialize(_eventBus);
    }

    [Test]
    public void OnPlayerDied_IncreasesFailStreak()
    {
        var initialStreak = _failStreakManager.GetCurrentStreak();
        _failStreakManager.OnPlayerDied(null);
        Assert.AreEqual(initialStreak + 1, _failStreakManager.GetCurrentStreak());
    }

    [Test]
    [TestCase(5)]
    [TestCase(10)]
    [TestCase(25)]
    [TestCase(50)]
    [TestCase(100)]
    public void StreakMilestone_UnlocksCosmetic(int milestone)
    {
        bool cosmeticUnlocked = false;
        _eventBus.Subscribe("CosmeticUnlocked", (data) => cosmeticUnlocked = true);
        
        for (int i = 0; i < milestone; i++)
            _failStreakManager.OnPlayerDied(null);
        
        Assert.IsTrue(cosmeticUnlocked);
    }
}
```

---

## 2. INTEGRATION TESTING

### Test Scenarios

#### Game Loop Integration
```csharp
[TestFixture]
public class GameLoopIntegrationTests
{
    private GameManager _gameManager;
    private int _eventsTriggered = 0;

    [SetUp]
    public void Setup()
    {
        _gameManager = GameManager.Instance;
        _eventsTriggered = 0;
    }

    [Test]
    public void CompleteGameLoop_TriggersAllSystems()
    {
        var eventBus = _gameManager.GetSystem<EventBus>();
        eventBus.Subscribe("PlayerDied", (data) => _eventsTriggered++);
        eventBus.Subscribe("StreakMilestoneReached", (data) => _eventsTriggered++);
        eventBus.Subscribe("ScoreChanged", (data) => _eventsTriggered++);

        // Simulate game loop
        _gameManager.ChangeGameState(GameManager.GameState.Playing);
        
        // Trigger events
        eventBus.Emit("PlayerDied", 100);
        eventBus.Emit("StreakMilestoneReached", new FailStreakManager.RewardTier());
        
        Assert.IsTrue(_eventsTriggered >= 2);
    }

    [Test]
    public void MultipleLoops_MaintainGameState()
    {
        _gameManager.ChangeGameState(GameManager.GameState.Playing);
        
        for (int i = 0; i < 10; i++)
        {
            _gameManager.Update();
            Assert.AreEqual(GameManager.GameState.Playing, _gameManager.CurrentState);
        }
    }
}
```

#### Cloud Sync Integration
```csharp
[TestFixture]
public class CloudSyncIntegrationTests
{
    private CloudSyncManager _cloudSync;
    private GameState _localState;
    private GameState _cloudState;

    [SetUp]
    public void Setup()
    {
        _cloudSync = new CloudSyncManager();
        _localState = new GameState { FailStreak = 10, TotalLoops = 100 };
        _cloudState = new GameState { FailStreak = 15, TotalLoops = 150 };
    }

    [Test]
    public async Task SyncWithCloud_KeepsNewerData()
    {
        _localState.LastModified = DateTime.Now.AddMinutes(-5);
        _cloudState.LastModified = DateTime.Now;
        
        var result = await _cloudSync.SyncWithCloud(_localState);
        
        Assert.AreEqual(_cloudState.FailStreak, result.FailStreak);
    }

    [Test]
    public async Task ConflictResolution_MergesDataCorrectly()
    {
        _localState.LastModified = DateTime.Now;
        _cloudState.LastModified = DateTime.Now;
        _localState.FailStreak = 20;
        _cloudState.FailStreak = 15;
        
        var result = await _cloudSync.SyncWithCloud(_localState);
        
        // Should take max value
        Assert.AreEqual(20, result.FailStreak);
    }
}
```

---

## 3. PERFORMANCE TESTING

### Performance Benchmarks

| Metric | Target | Acceptable | Critical |
|--------|--------|-----------|----------|
| **FPS** | 60 | 50+ | <30 |
| **Memory** | <150MB | <200MB | >250MB |
| **Load Time** | <2s | <3s | >5s |
| **Input Latency** | <50ms | <100ms | >150ms |
| **Crash Rate** | <0.01% | <0.1% | >1% |

### Performance Test Script
```csharp
[TestFixture]
public class PerformanceTests
{
    private Stopwatch _stopwatch;

    [SetUp]
    public void Setup()
    {
        _stopwatch = new Stopwatch();
    }

    [Test]
    public void GameInitialization_CompletesUnder2Seconds()
    {
        _stopwatch.Start();
        var gameManager = GameManager.Instance;
        _stopwatch.Stop();
        
        Assert.Less(_stopwatch.ElapsedMilliseconds, 2000);
    }

    [Test]
    public void ObstacleGeneration_Handles1000Obstacles()
    {
        var generator = new ObstacleGenerator();
        _stopwatch.Start();
        
        for (int i = 0; i < 1000; i++)
        {
            generator.SpawnObstacle();
        }
        
        _stopwatch.Stop();
        Assert.Less(_stopwatch.ElapsedMilliseconds, 5000);
    }

    [Test]
    public void MemoryUsage_StaysUnder150MB()
    {
        var initialMemory = SystemInfo.systemMemorySize - SystemInfo.systemMemoryFree;
        
        // Simulate gameplay
        for (int i = 0; i < 10000; i++)
        {
            var obj = new GameObject();
            Destroy(obj);
        }
        
        var finalMemory = SystemInfo.systemMemorySize - SystemInfo.systemMemoryFree;
        Assert.Less(finalMemory, 150 * 1024 * 1024); // 150MB
    }
}
```

---

## 4. GAMEPLAY TESTING

### Test Cases

#### Input Response
- [ ] Tap detection works within 50ms
- [ ] Swipe detection recognizes direction
- [ ] Hold detection triggers correctly
- [ ] Multi-touch doesn't cause crashes
- [ ] Input works with screen rotation

#### Difficulty Progression
- [ ] Difficulty increases at 85% success rate
- [ ] Difficulty decreases at 15% success rate
- [ ] Difficulty changes smoothly (no jumps)
- [ ] Difficulty stays within 0.2-1.0 range
- [ ] Player can't get stuck at max/min difficulty

#### Fail Streak System
- [ ] Streak increments on failure
- [ ] Streak doesn't reset on success
- [ ] Cosmetics unlock at correct thresholds
- [ ] Milestone notifications display
- [ ] Streak persists across sessions

#### Scoring System
- [ ] Base points awarded correctly
- [ ] Streak multiplier applies
- [ ] Milestone bonuses trigger
- [ ] Score displays correctly
- [ ] High score saves properly

---

## 5. COMPATIBILITY TESTING

### Device Testing Matrix

| Device | iOS | Android | Status |
|--------|-----|---------|--------|
| iPhone 12 | ✅ | - | Pass |
| iPhone 13 | ✅ | - | Pass |
| iPhone 14 Pro | ✅ | - | Pass |
| iPad Air | ✅ | - | Pass |
| Samsung S21 | - | ✅ | Pass |
| Samsung S22 | - | ✅ | Pass |
| Google Pixel 6 | - | ✅ | Pass |
| OnePlus 9 | - | ✅ | Pass |

### OS Version Testing

| Version | iOS | Android | Status |
|---------|-----|---------|--------|
| Latest | ✅ | ✅ | Pass |
| -1 | ✅ | ✅ | Pass |
| -2 | ✅ | ✅ | Pass |
| Minimum | ✅ | ✅ | Pass |

---

## 6. EDGE CASE TESTING

### Network Scenarios
- [ ] Game works offline
- [ ] Cloud sync handles no internet
- [ ] Game recovers from network loss
- [ ] Leaderboard updates with poor connection
- [ ] API calls retry on timeout

### Device Scenarios
- [ ] Game handles low memory
- [ ] Game handles low battery
- [ ] Game handles screen rotation
- [ ] Game handles app backgrounding
- [ ] Game handles app termination

### User Scenarios
- [ ] Player can't cheat by modifying saves
- [ ] Duplicate purchases are prevented
- [ ] Rapid input doesn't cause issues
- [ ] Session switching works correctly
- [ ] Multi-device sync resolves conflicts

---

## 7. SECURITY TESTING

### Authentication
- [ ] Invalid tokens are rejected
- [ ] Expired tokens trigger re-login
- [ ] Password reset works securely
- [ ] Session tokens can't be reused
- [ ] HTTPS is enforced

### Data Protection
- [ ] Sensitive data is encrypted
- [ ] Cloud saves are validated
- [ ] User data can't be accessed by others
- [ ] Analytics data is anonymized
- [ ] Payment data is PCI compliant

### Anti-Cheat
- [ ] Impossible scores are flagged
- [ ] Leaderboard entries are verified
- [ ] Cosmetic unlocks are validated
- [ ] Session data can't be modified
- [ ] Achievements can't be faked

---

## 8. REGRESSION TESTING

### Automated Regression Suite
```csharp
[TestFixture]
public class RegressionTests
{
    private GameManager _gameManager;

    [SetUp]
    public void Setup()
    {
        _gameManager = GameManager.Instance;
    }

    [Test]
    [Category("Regression")]
    public void PreviousBug_InputLag_IsFixed()
    {
        // Test that input latency is under 50ms
        var inputHandler = _gameManager.GetSystem<InputHandler>();
        var stopwatch = Stopwatch.StartNew();
        
        inputHandler.Update();
        
        stopwatch.Stop();
        Assert.Less(stopwatch.ElapsedMilliseconds, 50);
    }

    [Test]
    [Category("Regression")]
    public void PreviousBug_MemoryLeak_IsFixed()
    {
        var initialMemory = GC.GetTotalMemory(true);
        
        for (int i = 0; i < 1000; i++)
        {
            _gameManager.Update();
        }
        
        GC.Collect();
        var finalMemory = GC.GetTotalMemory(true);
        
        Assert.Less(finalMemory - initialMemory, 10 * 1024 * 1024); // 10MB
    }
}
```

---

## 9. USER ACCEPTANCE TESTING (UAT)

### UAT Checklist

#### Gameplay
- [ ] Game is fun and engaging
- [ ] Difficulty feels balanced
- [ ] Fail streak system is rewarding
- [ ] Cosmetics are visually appealing
- [ ] Game doesn't crash

#### User Experience
- [ ] Menu navigation is intuitive
- [ ] Controls are responsive
- [ ] Visuals are clear and readable
- [ ] Audio is appropriate
- [ ] Loading times are acceptable

#### Monetization
- [ ] IAP process is smooth
- [ ] Prices are reasonable
- [ ] Ads don't disrupt gameplay
- [ ] Cosmetics feel worth the price
- [ ] No pay-to-win mechanics

#### Performance
- [ ] Game runs smoothly (60 FPS)
- [ ] Battery drain is acceptable
- [ ] Data usage is reasonable
- [ ] Game doesn't overheat device
- [ ] No crashes or freezes

---

## 10. TEST EXECUTION SCHEDULE

### Pre-Release
- **Week 1-2**: Unit testing
- **Week 3-4**: Integration testing
- **Week 5-6**: Performance testing
- **Week 7-8**: Gameplay testing
- **Week 9-10**: UAT & final polish

### Continuous Integration
- **Pre-commit**: Unit tests
- **On push**: Integration tests
- **Nightly**: Full regression suite
- **Weekly**: Performance benchmarks

---

## 11. BUG TRACKING

### Bug Report Template
```
Title: [SEVERITY] Brief description

Severity: Critical/High/Medium/Low
Device: iPhone 12 / Samsung S21
OS: iOS 15.0 / Android 12
App Version: 1.0.0

Steps to Reproduce:
1. ...
2. ...
3. ...

Expected Result:
...

Actual Result:
...

Screenshots/Videos:
[Attach media]

Additional Notes:
...
```

### Bug Severity Levels
- **Critical**: Game crash, data loss, security issue
- **High**: Major feature broken, severe performance issue
- **Medium**: Feature partially broken, minor performance issue
- **Low**: UI issue, minor cosmetic problem

---

## 12. QUALITY METRICS

### Target Metrics
- **Code Coverage**: 80%+
- **Bug Escape Rate**: <1%
- **Test Pass Rate**: 99%+
- **Performance**: 60 FPS maintained
- **Crash Rate**: <0.1%
- **User Rating**: 4.5+ stars

### Tracking Dashboard
- Daily test execution results
- Code coverage trends
- Performance metrics
- Bug velocity
- User feedback sentiment

---

## CONCLUSION

This comprehensive testing strategy ensures Fail Frenzy: The Loop meets the highest quality standards and delivers an exceptional user experience.
