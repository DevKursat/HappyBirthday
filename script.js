document.addEventListener('DOMContentLoaded', () => {
    const formContainer = document.getElementById('form-container');
    const celebrationContainer = document.getElementById('celebration-container');
    const createButton = document.getElementById('create-button');
    const shareButton = document.getElementById('share-button');
    const shareContainer = document.getElementById('share-container');
    const copyFeedback = document.getElementById('copy-feedback');
    const nameInput = document.getElementById('name-input');
    const messageInput = document.getElementById('message-input');

    // --- Sound Generation (Web Audio API) ---
    let audioContext;
    const createAudioContext = () => {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    };

    const playNote = (frequency, duration, startTime) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    };

    const playBirthdaySong = () => {
        if (!audioContext) return;
        const now = audioContext.currentTime;
        const tempo = 2.2;
        const notes = [
            { freq: 261.63, dur: 0.5 / tempo }, { freq: 261.63, dur: 0.5 / tempo }, 
            { freq: 293.66, dur: 1 / tempo }, { freq: 261.63, dur: 1 / tempo },
            { freq: 349.23, dur: 1 / tempo }, { freq: 329.63, dur: 2 / tempo },
            
            { freq: 261.63, dur: 0.5 / tempo }, { freq: 261.63, dur: 0.5 / tempo },
            { freq: 293.66, dur: 1 / tempo }, { freq: 261.63, dur: 1 / tempo },
            { freq: 392.00, dur: 1 / tempo }, { freq: 349.23, dur: 2 / tempo },

            { freq: 261.63, dur: 0.5 / tempo }, { freq: 261.63, dur: 0.5 / tempo },
            { freq: 523.25, dur: 1 / tempo }, { freq: 440.00, dur: 1 / tempo },
            { freq: 349.23, dur: 1 / tempo }, { freq: 329.63, dur: 1 / tempo },
            { freq: 293.66, dur: 2 / tempo },

            { freq: 466.16, dur: 0.5 / tempo }, { freq: 466.16, dur: 0.5 / tempo },
            { freq: 440.00, dur: 1 / tempo }, { freq: 349.23, dur: 1 / tempo },
            { freq: 392.00, dur: 1 / tempo }, { freq: 349.23, dur: 2 / tempo },
        ];

        let currentTime = now + 0.5;
        notes.forEach(note => {
            playNote(note.freq, note.dur, currentTime);
            currentTime += note.dur;
        });
    };

    // --- Confetti --- 
    const launchConfetti = () => {
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    // --- Main Logic ---
    const showCelebration = (name, message) => {
        formContainer.classList.add('hidden');
        celebrationContainer.classList.remove('hidden');

        document.getElementById('celebration-name').textContent = `İyi ki doğdun ${name}!`;
        document.getElementById('celebration-message').textContent = message;

        setTimeout(() => {
            document.querySelector('.letter-wrapper').classList.add('open');
            createAudioContext(); // Create audio context on user interaction
            playBirthdaySong();
        }, 500);

        setTimeout(() => {
            document.getElementById('cake-container').classList.add('visible');
            launchConfetti();
        }, 2000); // After letter opens
    };

    const checkForCelebration = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const data = urlParams.get('q');
        if (data) {
            try {
                const decoded = atob(data);
                const [name, message] = decoded.split('|');
                if (name) {
                    showCelebration(name, message || 'Sana harika bir yıl diliyorum!');
                }
            } catch (e) {
                console.error('Failed to decode celebration data:', e);
            }
        }
    };

    createButton.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const message = messageInput.value.trim();
        if (!name) {
            alert('Lütfen bir isim girin.');
            return;
        }

        const data = `${name}|${message}`;
        const encoded = btoa(data);
        const url = `${window.location.origin}${window.location.pathname}?q=${encoded}`;
        
        shareContainer.classList.remove('hidden');
        
        // Store the URL for the share button
        shareButton.dataset.url = url;
    });

    shareButton.addEventListener('click', async () => {
        const url = shareButton.dataset.url;
        const name = nameInput.value.trim();
        const shareData = {
            title: 'Doğum Günü Sürprizi!',
            text: `${name} için bir doğum günü kartın var!`,
            url: url
        };

        if (navigator.share && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Share failed:', err);
            }
        } else {
            navigator.clipboard.writeText(url).then(() => {
                copyFeedback.classList.remove('hidden');
                setTimeout(() => copyFeedback.classList.add('hidden'), 2000);
            });
        }
    });

    // Check for shared link on page load
    checkForCelebration();
});
