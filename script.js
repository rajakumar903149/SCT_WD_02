class Stopwatch {
    constructor() {
        this.startTime = 0;
        this.elapsedTime = 0;
        this.timerInterval = null;
        this.isRunning = false;
        this.lapTimes = [];
        this.lastLapTime = 0;
        
        // DOM Elements
        this.timeDisplay = document.getElementById('timeDisplay');
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.lapBtn = document.getElementById('lapBtn');
        this.lapsList = document.getElementById('lapsList');
        
        // Initialize event listeners
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.stopBtn.addEventListener('click', () => this.stop());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.lapBtn.addEventListener('click', () => this.recordLap());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.isRunning) {
                    this.stop();
                } else {
                    this.start();
                }
            } else if (e.code === 'KeyL' && this.isRunning) {
                e.preventDefault();
                this.recordLap();
            } else if (e.code === 'KeyR') {
                e.preventDefault();
                this.reset();
            }
        });
    }

    start() {
        if (!this.isRunning) {
            this.startTime = Date.now() - this.elapsedTime;
            this.timerInterval = setInterval(() => this.updateTime(), 10);
            this.isRunning = true;
            this.updateButtonStates();
            document.body.classList.add('running');
        }
    }

    stop() {
        if (this.isRunning) {
            clearInterval(this.timerInterval);
            this.isRunning = false;
            this.updateButtonStates();
            document.body.classList.remove('running');
        }
    }

    reset() {
        this.stop();
        this.elapsedTime = 0;
        this.lapTimes = [];
        this.lastLapTime = 0;
        this.updateDisplay();
        this.clearLapsList();
        this.updateButtonStates();
    }

    recordLap() {
        if (this.isRunning) {
            const currentTime = this.elapsedTime;
            const lapTime = currentTime - this.lastLapTime;
            this.lastLapTime = currentTime;
            
            this.lapTimes.push({
                number: this.lapTimes.length + 1,
                time: currentTime,
                lapTime: lapTime
            });
            
            this.addLapToDOM(this.lapTimes[this.lapTimes.length - 1]);
        }
    }

    updateTime() {
        this.elapsedTime = Date.now() - this.startTime;
        this.updateDisplay();
    }

    updateDisplay() {
        const milliseconds = Math.floor(this.elapsedTime % 1000);
        const seconds = Math.floor((this.elapsedTime / 1000) % 60);
        const minutes = Math.floor((this.elapsedTime / (1000 * 60)) % 60);
        const hours = Math.floor(this.elapsedTime / (1000 * 60 * 60));

        this.timeDisplay.querySelector('.hours').textContent = hours.toString().padStart(2, '0');
        this.timeDisplay.querySelector('.minutes').textContent = minutes.toString().padStart(2, '0');
        this.timeDisplay.querySelector('.seconds').textContent = seconds.toString().padStart(2, '0');
        this.timeDisplay.querySelector('.milliseconds').textContent = milliseconds.toString().padStart(3, '0').slice(0, 2);
    }

    updateButtonStates() {
        this.startBtn.disabled = this.isRunning;
        this.stopBtn.disabled = !this.isRunning;
        this.lapBtn.disabled = !this.isRunning;
    }

    addLapToDOM(lap) {
        const lapItem = document.createElement('div');
        lapItem.className = 'lap-item';
        
        const lapTimeFormatted = this.formatTime(lap.lapTime);
        const totalTimeFormatted = this.formatTime(lap.time);
        
        lapItem.innerHTML = `
            <span class="lap-number">#${lap.number}</span>
            <span class="lap-time">${lapTimeFormatted}</span>
            <span class="lap-difference">${totalTimeFormatted}</span>
        `;
        
        // Add animation for new lap
        lapItem.style.animation = 'slideIn 0.3s ease';
        
        this.lapsList.prepend(lapItem);
        
        // Auto-scroll to new lap
        this.lapsList.scrollTop = 0;
    }

    clearLapsList() {
        this.lapsList.innerHTML = '<div class="no-laps">No lap times recorded yet</div>';
    }

    formatTime(time) {
        const milliseconds = Math.floor(time % 1000);
        const seconds = Math.floor((time / 1000) % 60);
        const minutes = Math.floor((time / (1000 * 60)) % 60);
        const hours = Math.floor(time / (1000 * 60 * 60));

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0').slice(0, 2)}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0').slice(0, 2)}`;
        }
    }
}

// Initialize the stopwatch when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const stopwatch = new Stopwatch();
    
    // Add initial message to laps list
    document.getElementById('lapsList').innerHTML = '<div class="no-laps">No lap times recorded yet</div>';
    
    // Add help tooltip for keyboard shortcuts
    const helpTooltip = document.createElement('div');
    helpTooltip.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.9);
        padding: 10px 15px;
        border-radius: 10px;
        font-size: 0.8rem;
        color: #333;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(10px);
        z-index: 1000;
    `;
    helpTooltip.innerHTML = `
        <strong>Keyboard Shortcuts:</strong><br>
        - Space: Start/Stop<br>
        - L: Record Lap<br>
        - R: Reset
    `;
    document.body.appendChild(helpTooltip);
    
    // Hide tooltip after 10 seconds
    setTimeout(() => {
        helpTooltip.style.opacity = '0';
        helpTooltip.style.transition = 'opacity 1s ease';
        setTimeout(() => helpTooltip.remove(), 1000);
    }, 10000);
});

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((registration) => {
            console.log('SW registered: ', registration);
        }).catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}