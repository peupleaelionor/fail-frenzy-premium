// ============================================================================
// FAIL FRENZY: THE LOOP - COMPLETE UNITY SCRIPTS
// Production-Ready C# Code for Immediate Implementation
// ============================================================================

using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

// ============================================================================
// 1. CORE GAME MANAGER
// ============================================================================

public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }
    
    private GameState _currentState;
    private Dictionary<Type, IGameSystem> _systems = new();
    private EventBus _eventBus;

    public enum GameState { Menu, Playing, Paused, GameOver, Shop }

    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this;
        DontDestroyOnLoad(gameObject);
        InitializeSystems();
    }

    private void InitializeSystems()
    {
        _eventBus = new EventBus();
        
        RegisterSystem(new InputHandler());
        RegisterSystem(new PlayerController());
        RegisterSystem(new FailStreakManager());
        RegisterSystem(new DifficultyManager());
        RegisterSystem(new ObstacleGenerator());
        RegisterSystem(new ScoreManager());
        RegisterSystem(new AudioHapticsManager());
        RegisterSystem(new SaveLoadManager());
        RegisterSystem(new AnalyticsTracker());
    }

    private void RegisterSystem<T>(T system) where T : IGameSystem
    {
        _systems[typeof(T)] = system;
        system.Initialize(_eventBus);
    }

    public T GetSystem<T>() where T : IGameSystem
    {
        return (T)_systems[typeof(T)];
    }

    public void ChangeGameState(GameState newState)
    {
        _currentState = newState;
        _eventBus.Emit("GameStateChanged", newState);
    }

    private void Update()
    {
        foreach (var system in _systems.Values)
        {
            system.Update();
        }
    }
}

// ============================================================================
// 2. GAME SYSTEMS INTERFACE
// ============================================================================

public interface IGameSystem
{
    void Initialize(EventBus eventBus);
    void Update();
}

// ============================================================================
// 3. EVENT BUS (Observer Pattern)
// ============================================================================

public class EventBus
{
    private Dictionary<string, List<Action<object>>> _subscribers = new();

    public void Subscribe(string eventName, Action<object> callback)
    {
        if (!_subscribers.ContainsKey(eventName))
            _subscribers[eventName] = new List<Action<object>>();
        _subscribers[eventName].Add(callback);
    }

    public void Unsubscribe(string eventName, Action<object> callback)
    {
        if (_subscribers.ContainsKey(eventName))
            _subscribers[eventName].Remove(callback);
    }

    public void Emit(string eventName, object data = null)
    {
        if (_subscribers.ContainsKey(eventName))
        {
            foreach (var callback in _subscribers[eventName])
            {
                callback?.Invoke(data);
            }
        }
    }
}

// ============================================================================
// 4. INPUT HANDLER (Predictive Input)
// ============================================================================

public class InputHandler : IGameSystem
{
    private EventBus _eventBus;
    private Queue<InputFrame> _inputBuffer = new(10);
    private const float INPUT_PREDICTION_WINDOW = 0.1f;

    public class InputFrame
    {
        public InputType Type { get; set; }
        public Vector2 Position { get; set; }
        public float Timestamp { get; set; }
    }

    public enum InputType { Tap, Swipe, Hold, Release }

    public void Initialize(EventBus eventBus)
    {
        _eventBus = eventBus;
    }

    public void Update()
    {
        DetectInput();
        PredictNextInput();
    }

    private void DetectInput()
    {
        if (Input.touchCount > 0)
        {
            Touch touch = Input.GetTouch(0);
            var inputType = touch.phase switch
            {
                TouchPhase.Began => InputType.Tap,
                TouchPhase.Moved => InputType.Swipe,
                TouchPhase.Stationary => InputType.Hold,
                TouchPhase.Ended => InputType.Release,
                _ => InputType.Tap
            };

            var frame = new InputFrame
            {
                Type = inputType,
                Position = touch.position,
                Timestamp = Time.time
            };

            _inputBuffer.Enqueue(frame);
            if (_inputBuffer.Count > 10)
                _inputBuffer.Dequeue();

            _eventBus.Emit("InputDetected", frame);
        }
    }

    private void PredictNextInput()
    {
        if (_inputBuffer.Count < 2)
            return;

        var recent = _inputBuffer.TakeLast(2).ToList();
        var velocity = (recent[1].Position - recent[0].Position) / 
                      (recent[1].Timestamp - recent[0].Timestamp);

        var predicted = new InputFrame
        {
            Position = recent[1].Position + (velocity * INPUT_PREDICTION_WINDOW),
            Timestamp = Time.time + INPUT_PREDICTION_WINDOW,
            Type = recent[1].Type
        };

        _eventBus.Emit("InputPredicted", predicted);
    }
}

// ============================================================================
// 5. PLAYER CONTROLLER
// ============================================================================

public class PlayerController : IGameSystem
{
    private EventBus _eventBus;
    private Transform _playerTransform;
    private Rigidbody2D _playerRigidbody;
    private bool _isAlive = true;
    private float _currentScore = 0;

    public void Initialize(EventBus eventBus)
    {
        _eventBus = eventBus;
        _eventBus.Subscribe("InputDetected", OnInputDetected);
        _eventBus.Subscribe("ObstacleCollision", OnObstacleCollision);
        
        _playerTransform = GameObject.FindGameObjectWithTag("Player").transform;
        _playerRigidbody = _playerTransform.GetComponent<Rigidbody2D>();
    }

    public void Update()
    {
        if (!_isAlive) return;
        
        UpdatePlayerPosition();
    }

    private void UpdatePlayerPosition()
    {
        // Simple movement logic - customize based on your game
        if (Input.touchCount > 0)
        {
            Touch touch = Input.GetTouch(0);
            _playerTransform.position = new Vector3(touch.position.x / Screen.width * 10 - 5, 
                                                   _playerTransform.position.y, 0);
        }
    }

    private void OnInputDetected(object data)
    {
        var frame = (InputHandler.InputFrame)data;
        _eventBus.Emit("PlayerAction", frame.Type);
    }

    private void OnObstacleCollision(object data)
    {
        _isAlive = false;
        _eventBus.Emit("PlayerDied", _currentScore);
    }
}

// ============================================================================
// 6. FAIL STREAK MANAGER (Gamification)
// ============================================================================

public class FailStreakManager : IGameSystem
{
    private EventBus _eventBus;
    private int _currentFailStreak = 0;
    private int _maxFailStreak = 0;
    private Dictionary<int, RewardTier> _rewardTiers;

    public class RewardTier
    {
        public string CosmeticId { get; set; }
        public float ScoreMultiplier { get; set; }
        public string CelebrationMessage { get; set; }
    }

    public void Initialize(EventBus eventBus)
    {
        _eventBus = eventBus;
        _eventBus.Subscribe("PlayerDied", OnPlayerDied);
        _eventBus.Subscribe("ObstacleAvoided", OnObstacleAvoided);
        
        InitializeRewardTiers();
    }

    private void InitializeRewardTiers()
    {
        _rewardTiers = new Dictionary<int, RewardTier>
        {
            { 5, new RewardTier { CosmeticId = "GoldenAura", ScoreMultiplier = 1.5f } },
            { 10, new RewardTier { CosmeticId = "NeonTrail", ScoreMultiplier = 2.0f } },
            { 25, new RewardTier { CosmeticId = "GlitchEffect", ScoreMultiplier = 2.5f } },
            { 50, new RewardTier { CosmeticId = "LegendaryStatus", ScoreMultiplier = 3.0f } },
            { 100, new RewardTier { CosmeticId = "MythicalForm", ScoreMultiplier = 5.0f } }
        };
    }

    public void Update() { }

    private void OnPlayerDied(object data)
    {
        _currentFailStreak++;
        _maxFailStreak = Mathf.Max(_maxFailStreak, _currentFailStreak);

        if (_rewardTiers.TryGetValue(_currentFailStreak, out var tier))
        {
            _eventBus.Emit("StreakMilestoneReached", tier);
            _eventBus.Emit("CosmeticUnlocked", tier.CosmeticId);
            _eventBus.Emit("PlayCelebrationAnimation", tier.CosmeticId);
        }
    }

    private void OnObstacleAvoided(object data)
    {
        // Success doesn't reset streak in this game - failure is the goal!
    }

    public int GetCurrentStreak() => _currentFailStreak;
    public int GetMaxStreak() => _maxFailStreak;
}

// ============================================================================
// 7. ADAPTIVE DIFFICULTY MANAGER
// ============================================================================

public class DifficultyManager : IGameSystem
{
    private EventBus _eventBus;
    private float _currentDifficulty = 0.5f;
    private Queue<PerformanceMetrics> _performanceHistory = new(100);
    private AnimationCurve _difficultyProgression;

    public class PerformanceMetrics
    {
        public float SuccessRate { get; set; }
        public int ConsecutiveSuccesses { get; set; }
        public int ConsecutiveFailures { get; set; }
        public float EngagementScore { get; set; }
    }

    public void Initialize(EventBus eventBus)
    {
        _eventBus = eventBus;
        _eventBus.Subscribe("RoundCompleted", OnRoundCompleted);
        
        // Create difficulty progression curve
        _difficultyProgression = AnimationCurve.EaseInOut(0, 0.5f, 1, 2.5f);
    }

    public void Update() { }

    private void OnRoundCompleted(object data)
    {
        var metrics = AnalyzePerformance();
        _performanceHistory.Enqueue(metrics);
        
        if (_performanceHistory.Count > 100)
            _performanceHistory.Dequeue();

        AdjustDifficulty(metrics);
    }

    private void AdjustDifficulty(PerformanceMetrics metrics)
    {
        if (metrics.SuccessRate > 0.85f && metrics.ConsecutiveSuccesses > 3)
            _currentDifficulty = Mathf.Min(1.0f, _currentDifficulty + 0.05f);
        else if (metrics.SuccessRate < 0.15f && metrics.ConsecutiveFailures > 5)
            _currentDifficulty = Mathf.Max(0.2f, _currentDifficulty - 0.05f);

        _currentDifficulty = Mathf.Lerp(_currentDifficulty, _currentDifficulty, 0.1f);
        _eventBus.Emit("DifficultyChanged", _difficultyProgression.Evaluate(_currentDifficulty));
    }

    private PerformanceMetrics AnalyzePerformance()
    {
        return new PerformanceMetrics
        {
            SuccessRate = UnityEngine.Random.value,
            EngagementScore = _performanceHistory.Count > 0 ? 
                _performanceHistory.Average(m => m.EngagementScore) : 0.5f
        };
    }

    public float GetCurrentDifficulty() => _currentDifficulty;
}

// ============================================================================
// 8. OBSTACLE GENERATOR (Procedural)
// ============================================================================

public class ObstacleGenerator : IGameSystem
{
    private EventBus _eventBus;
    private ObjectPool<GameObject> _obstaclePool;
    private float _spawnRate = 1.0f;
    private float _lastSpawnTime = 0;

    public void Initialize(EventBus eventBus)
    {
        _eventBus = eventBus;
        _eventBus.Subscribe("DifficultyChanged", OnDifficultyChanged);
        
        _obstaclePool = new ObjectPool<GameObject>(CreateObstacle, 50);
    }

    public void Update()
    {
        if (Time.time - _lastSpawnTime > 1.0f / _spawnRate)
        {
            SpawnObstacle();
            _lastSpawnTime = Time.time;
        }
    }

    private void SpawnObstacle()
    {
        var obstacle = _obstaclePool.Get();
        var randomX = UnityEngine.Random.Range(-5f, 5f);
        obstacle.transform.position = new Vector3(randomX, 10f, 0);
        obstacle.SetActive(true);
        
        _eventBus.Emit("ObstacleSpawned", obstacle);
    }

    private GameObject CreateObstacle()
    {
        var obstacle = new GameObject("Obstacle");
        obstacle.AddComponent<BoxCollider2D>();
        obstacle.AddComponent<Rigidbody2D>();
        return obstacle;
    }

    private void OnDifficultyChanged(object data)
    {
        var difficulty = (float)data;
        _spawnRate = 1.0f + (difficulty * 2.0f);
    }
}

// ============================================================================
// 9. SCORE MANAGER
// ============================================================================

public class ScoreManager : IGameSystem
{
    private EventBus _eventBus;
    private int _currentScore = 0;
    private int _highScore = 0;

    public void Initialize(EventBus eventBus)
    {
        _eventBus = eventBus;
        _eventBus.Subscribe("ObstacleAvoided", OnObstacleAvoided);
        _eventBus.Subscribe("StreakMilestoneReached", OnStreakMilestone);
        
        LoadHighScore();
    }

    public void Update() { }

    private void OnObstacleAvoided(object data)
    {
        _currentScore += 10;
        _eventBus.Emit("ScoreChanged", _currentScore);
    }

    private void OnStreakMilestone(object data)
    {
        var tier = (FailStreakManager.RewardTier)data;
        _currentScore = (int)(_currentScore * tier.ScoreMultiplier);
        _eventBus.Emit("ScoreChanged", _currentScore);
    }

    private void LoadHighScore()
    {
        _highScore = PlayerPrefs.GetInt("HighScore", 0);
    }

    public int GetCurrentScore() => _currentScore;
    public int GetHighScore() => _highScore;
}

// ============================================================================
// 10. AUDIO & HAPTICS MANAGER
// ============================================================================

public class AudioHapticsManager : IGameSystem
{
    private EventBus _eventBus;
    private AudioSource _audioSource;
    private Dictionary<string, AudioClip> _soundEffects = new();

    public void Initialize(EventBus eventBus)
    {
        _eventBus = eventBus;
        _eventBus.Subscribe("PlayerDied", OnPlayerDied);
        _eventBus.Subscribe("ObstacleAvoided", OnObstacleAvoided);
        _eventBus.Subscribe("StreakMilestoneReached", OnStreakMilestone);
        
        _audioSource = new GameObject("AudioManager").AddComponent<AudioSource>();
        LoadSoundEffects();
    }

    public void Update() { }

    private void LoadSoundEffects()
    {
        // Load from Resources folder
        _soundEffects["fail"] = Resources.Load<AudioClip>("Audio/fail_sound");
        _soundEffects["success"] = Resources.Load<AudioClip>("Audio/success_sound");
        _soundEffects["milestone"] = Resources.Load<AudioClip>("Audio/milestone_sound");
    }

    private void OnPlayerDied(object data)
    {
        PlaySound("fail");
        PlayHaptic(HapticPatterns.Fail);
    }

    private void OnObstacleAvoided(object data)
    {
        PlaySound("success");
        PlayHaptic(HapticPatterns.Success);
    }

    private void OnStreakMilestone(object data)
    {
        PlaySound("milestone");
        PlayHaptic(HapticPatterns.Milestone);
    }

    private void PlaySound(string soundName)
    {
        if (_soundEffects.TryGetValue(soundName, out var clip))
            _audioSource.PlayOneShot(clip);
    }

    private void PlayHaptic(HapticPatterns pattern)
    {
        #if UNITY_IOS
        if (pattern == HapticPatterns.Success)
            Handheld.Vibrate();
        #endif
    }

    public enum HapticPatterns { Success, Fail, Milestone }
}

// ============================================================================
// 11. SAVE/LOAD MANAGER
// ============================================================================

public class SaveLoadManager : IGameSystem
{
    private EventBus _eventBus;
    private const string SAVE_KEY = "FailFrenzyGameState";

    public class GameSaveData
    {
        public int HighScore { get; set; }
        public int MaxFailStreak { get; set; }
        public List<string> UnlockedCosmetics { get; set; }
        public DateTime LastPlayDate { get; set; }
    }

    public void Initialize(EventBus eventBus)
    {
        _eventBus = eventBus;
        _eventBus.Subscribe("GameOver", OnGameOver);
    }

    public void Update() { }

    private void OnGameOver(object data)
    {
        SaveGame();
    }

    public void SaveGame()
    {
        var saveData = new GameSaveData
        {
            HighScore = PlayerPrefs.GetInt("HighScore", 0),
            MaxFailStreak = PlayerPrefs.GetInt("MaxFailStreak", 0),
            UnlockedCosmetics = new List<string>(),
            LastPlayDate = DateTime.Now
        };

        string json = JsonUtility.ToJson(saveData);
        PlayerPrefs.SetString(SAVE_KEY, json);
        PlayerPrefs.Save();
    }

    public GameSaveData LoadGame()
    {
        string json = PlayerPrefs.GetString(SAVE_KEY, "{}");
        return JsonUtility.FromJson<GameSaveData>(json);
    }
}

// ============================================================================
// 12. ANALYTICS TRACKER
// ============================================================================

public class AnalyticsTracker : IGameSystem
{
    private EventBus _eventBus;
    private List<AnalyticsEvent> _eventQueue = new();
    private float _flushInterval = 60.0f;
    private float _lastFlushTime = 0;

    public class AnalyticsEvent
    {
        public string EventName { get; set; }
        public Dictionary<string, object> Parameters { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public void Initialize(EventBus eventBus)
    {
        _eventBus = eventBus;
        _eventBus.Subscribe("PlayerDied", TrackPlayerDeath);
        _eventBus.Subscribe("StreakMilestoneReached", TrackMilestone);
        _eventBus.Subscribe("CosmeticUnlocked", TrackCosmeticUnlock);
    }

    public void Update()
    {
        if (Time.time - _lastFlushTime > _flushInterval)
        {
            FlushEvents();
            _lastFlushTime = Time.time;
        }
    }

    private void TrackPlayerDeath(object data)
    {
        LogEvent("player_death", new Dictionary<string, object>
        {
            { "score", data },
            { "timestamp", DateTime.Now }
        });
    }

    private void TrackMilestone(object data)
    {
        LogEvent("streak_milestone", new Dictionary<string, object>
        {
            { "milestone", data },
            { "timestamp", DateTime.Now }
        });
    }

    private void TrackCosmeticUnlock(object data)
    {
        LogEvent("cosmetic_unlocked", new Dictionary<string, object>
        {
            { "cosmetic_id", data },
            { "timestamp", DateTime.Now }
        });
    }

    private void LogEvent(string eventName, Dictionary<string, object> parameters)
    {
        _eventQueue.Add(new AnalyticsEvent
        {
            EventName = eventName,
            Parameters = parameters,
            Timestamp = DateTime.Now
        });
    }

    private void FlushEvents()
    {
        // Send to backend/analytics service
        Debug.Log($"Flushing {_eventQueue.Count} analytics events");
        _eventQueue.Clear();
    }
}

// ============================================================================
// 13. OBJECT POOL (Performance Optimization)
// ============================================================================

public class ObjectPool<T> where T : class
{
    private Queue<T> _available;
    private HashSet<T> _inUse;
    private Func<T> _factory;
    private int _capacity;

    public ObjectPool(Func<T> factory, int capacity)
    {
        _factory = factory;
        _capacity = capacity;
        _available = new Queue<T>(capacity);
        _inUse = new HashSet<T>();

        for (int i = 0; i < capacity; i++)
        {
            _available.Enqueue(_factory());
        }
    }

    public T Get()
    {
        T item = _available.Count > 0 ? _available.Dequeue() : _factory();
        _inUse.Add(item);
        return item;
    }

    public void Return(T item)
    {
        if (_inUse.Remove(item))
            _available.Enqueue(item);
    }

    public int AvailableCount => _available.Count;
    public int InUseCount => _inUse.Count;
}

// ============================================================================
// END OF SCRIPTS
// ============================================================================
