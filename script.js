document.addEventListener('DOMContentLoaded', () => {
    // --- Elementleri Seçme ---
    const formContainer = document.getElementById('form-container');
    const pinataContainer = document.getElementById('pinata-container');
    const celebrationContainer = document.getElementById('celebration-container');
    const finalMessageContainer = document.getElementById('final-message-container');

    const createButton = document.getElementById('create-button');
    const nameInput = document.getElementById('name-input');
    const messageInput = document.getElementById('message-input');

    const pinataHeading = document.getElementById('pinata-heading');
    const pinataSvg = document.getElementById('pinata-svg');
    const pinataBody = document.getElementById('pinata-body');
    const cracks = document.querySelectorAll('.crack');

    const letter = document.getElementById('letter');
    const cakeContainer = document.getElementById('cake-container');
    const blower = document.getElementById('blower');
    const flame = document.getElementById('flame');

    const finalMessage = document.getElementById('final-message');

    // --- Değişkenler ---
    let audioContext;
    let pinataClicks = 0;
    const MAX_CLICKS = 4;
    let micStream;
    let analyser;

    // --- Ses ve Mikrofon Fonksiyonları ---
    const createAudioContext = () => {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    };

    const playSound = (type, time) => {
        if (!audioContext) return;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        if (type === 'crack') {
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(80 + Math.random() * 40, time);
            gainNode.gain.setValueAtTime(0.3, time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        } else if (type === 'whoosh') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(400, time);
            oscillator.frequency.exponentialRampToValueAtTime(100, time + 0.3);
            gainNode.gain.setValueAtTime(0.4, time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
        }

        oscillator.start(time);
        oscillator.stop(time + 0.3);
    };

    const playBirthdaySong = () => {
        const notes = [
            { f: 261.63, d: 0.2 }, { f: 261.63, d: 0.2 }, { f: 293.66, d: 0.4 }, { f: 261.63, d: 0.4 },
            { f: 349.23, d: 0.4 }, { f: 329.63, d: 0.8 }, { f: 261.63, d: 0.2 }, { f: 261.63, d: 0.2 },
            { f: 293.66, d: 0.4 }, { f: 261.63, d: 0.4 }, { f: 392.00, d: 0.4 }, { f: 349.23, d: 0.8 },
        ];
        let currentTime = audioContext.currentTime + 0.5;
        notes.forEach(note => {
            const oscillator = audioContext.createOscillator();
            oscillator.frequency.value = note.f;
            oscillator.connect(audioContext.destination);
            oscillator.start(currentTime);
            oscillator.stop(currentTime + note.d);
            currentTime += note.d;
        });
    };

    const listenToMic = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        dataArray.forEach(value => sum += value);
        const average = sum / dataArray.length;

        if (average > 60) { // Eşik değeri - üfleme hassasiyeti
            blowOutCandle();
        }
        if (micStream && micStream.active) {
            requestAnimationFrame(listenToMic);
        }
    };

    // --- Animasyon ve Geçiş Fonksiyonları ---
    const launchConfetti = () => {
        confetti({ particleCount: 150, spread: 180, origin: { y: 0.6 } });
    };

    const blowOutCandle = () => {
        if (micStream) micStream.getTracks().forEach(track => track.stop());
        cakeContainer.removeEventListener('click', blowOutCandle);

        const currentWishPrompt = cakeContainer.querySelector('#wish-prompt');
        if (currentWishPrompt) {
            currentWishPrompt.style.opacity = '0';
        }
        playSound('whoosh', audioContext.currentTime);
        blower.classList.remove('hidden');
        blower.classList.add('blow');

        setTimeout(() => {
            flame.classList.add('puff');
        }, 500);

        setTimeout(() => {
            finalMessageContainer.classList.add('darken');
            cakeContainer.style.opacity = '0';
            finalMessage.classList.remove('hidden');
            finalMessage.style.opacity = '1'; // Explicitly set opacity to 1
            finalMessage.style.transform = 'none'; // Reset transform
        }, 2000);
    };

    const startFinalScene = async () => {
        celebrationContainer.style.opacity = '0';
        finalMessageContainer.classList.remove('hidden');

        cakeContainer.style.transition = 'none';
        cakeContainer.style.bottom = '50%';
        cakeContainer.style.transform = 'translateX(-50%) translateY(50%) scale(1.5)';
        
        // wishPrompt'u dinamik olarak oluştur ve cakeContainer içine ekle
        const wishPrompt = document.createElement('p');
        wishPrompt.id = 'wish-prompt';
        cakeContainer.appendChild(wishPrompt);
        wishPrompt.classList.add('visible'); // Element eklendikten sonra görünür yap

        // Mikrofonu ayarlamayı dene
        try {
            micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(micStream);
            source.connect(analyser);
            wishPrompt.textContent = 'Bir dilek tut ve ekrana doğru üfle!';
            listenToMic();
        } catch (err) {
            console.error('Mikrofon erişimi reddedildi veya bulunamadı:', err);
            wishPrompt.textContent = 'Bir dilek tut ve mumu üflemek için pastaya dokun!';
        }
        // Her durumda dokunma alternatifini ekle
        cakeContainer.addEventListener('click', blowOutCandle, { once: true });

        // finalMessageContainer'a cakeContainer'ı ekle (eğer henüz eklenmediyse)
        if (!finalMessageContainer.contains(cakeContainer)) {
            finalMessageContainer.appendChild(cakeContainer);
        }
    };

    const startCelebration = (name, message) => {
        pinataContainer.style.opacity = '0';
        setTimeout(() => {
            pinataContainer.classList.add('hidden');
            celebrationContainer.classList.remove('hidden');

            document.getElementById('celebration-name').textContent = `İyi ki doğdun ${name}!`;
            document.getElementById('celebration-message').textContent = message;

            playBirthdaySong();

            setTimeout(() => letter.classList.add('open'), 500);
            setTimeout(() => cakeContainer.classList.add('visible'), 2000);
            setTimeout(launchConfetti, 2500);
            setTimeout(startFinalScene, 8000);
        }, 500);
    };

    const handlePinataClick = (event) => {
        createAudioContext();
        playSound('crack', audioContext.currentTime);
        pinataClicks++;
        pinataSvg.classList.add('shake');
        setTimeout(() => pinataSvg.classList.remove('shake'), 500);

        if (pinataClicks <= cracks.length) {
            document.getElementById(`crack${pinataClicks}`).style.opacity = '1';
        }

        if (pinataClicks >= MAX_CLICKS) {
            pinataSvg.removeEventListener('click', handlePinataClick);
            pinataBody.classList.add('broken');
            launchConfetti();
            const { name, message } = event.currentTarget.dataset;
            setTimeout(() => startCelebration(name, message), 500);
        }
    };

    // --- Ana Mantık ---
    const checkForInvitation = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const data = urlParams.get('q');
        if (data) {
            try {
                const [name, message] = decodeURIComponent(data).split('|');
                if (name) {
                    formContainer.classList.add('hidden');
                    pinataContainer.classList.remove('hidden');
                    pinataHeading.textContent = `${name}, sana bir sürprizim var!`;
                    pinataSvg.dataset.name = name;
                    pinataSvg.dataset.message = message || 'Sana harika bir yıl diliyorum!';
                    pinataSvg.addEventListener('click', handlePinataClick);
                }
            } catch (e) { console.error('Link verisi okunamadı:', e); }
        }
    };

    const notifySuccess = (text) => {
        const originalText = createButton.textContent;
        createButton.textContent = text;
        createButton.disabled = true;
        setTimeout(() => {
            createButton.textContent = originalText;
            createButton.disabled = false;
        }, 2000);
    };

    const fallbackCopyToClipboard = (text) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed"; 
        textArea.style.top = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            notifySuccess('Kopyalandı!');
        } catch (err) {
            alert('Link otomatik kopyalanamadı. Lütfen manuel olarak kopyalayın.');
        }
        document.body.removeChild(textArea);
    };

    createButton.addEventListener('click', async () => {
        const name = nameInput.value.trim();
        if (!name) return alert('Lütfen bir isim girin.');
        const message = messageInput.value.trim();
        const url = `https://birthday.bykursat.me/?q=${encodeURIComponent(`${name}|${message}`)}`;

        const shareData = { title: 'Doğum Günü Sürprizi!', text: `${name} için bir sürprizin var!`, url };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                // Kullanıcı başarıyla paylaştı, burada ek bir bildirim gerekmiyor.
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Paylaşım hatası, kopyalamaya geçiliyor:', err);
                    fallbackCopyToClipboard(url);
                }
                // Kullanıcı paylaşımı iptal ederse (AbortError), hiçbir şey yapma.
            }
        } else {
            // navigator.share desteklenmiyorsa (örn. masaüstü)
            if (navigator.clipboard && navigator.clipboard.writeText) {
                try {
                    await navigator.clipboard.writeText(url);
                    notifySuccess('Kopyalandı!');
                } catch (err) {
                    fallbackCopyToClipboard(url);
                }
            } else {
                fallbackCopyToClipboard(url);
            }
        }
    });

    checkForInvitation();
});
