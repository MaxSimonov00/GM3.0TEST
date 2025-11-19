
// Музыкальные треки - используя более стабильные preview ссылки
const MUSIC_TRACKS = {
    // Cyberpunk/Sci-fi vibe for menu
    MENU: 'https://assets.mixkit.co/music/preview/mixkit-deep-urban-future-1119.mp3', 
    // Cinematic/Battle vibe
    BATTLE: 'https://assets.mixkit.co/music/preview/mixkit-warrior-strut-2258.mp3', 
};

class AudioManager {
    private musicPlayer: HTMLAudioElement;
    private audioContext: AudioContext | null = null;
    private musicVolume: number = 0.5;
    private sfxVolume: number = 0.5;
    private currentTrack: string | null = null;
    private initialized: boolean = false;

    constructor() {
        this.musicPlayer = new Audio();
        this.musicPlayer.loop = true;
        
        // Handle loading errors (e.g. 404 or format not supported)
        this.musicPlayer.addEventListener('error', (e) => {
            console.warn("Audio playback error:", e);
            this.currentTrack = null; // Reset track so we can try loading again later
        });
    }

    initialize() {
        if (this.initialized) return;
        
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                this.audioContext = new AudioContextClass();
            }
            this.initialized = true;
        } catch (e) {
            console.warn("AudioContext not supported or blocked", e);
        }
    }

    setMusicVolume(vol: number) {
        this.musicVolume = vol;
        this.musicPlayer.volume = vol;
    }

    setSfxVolume(vol: number) {
        this.sfxVolume = vol;
    }

    async playMusic(type: 'MENU' | 'BATTLE') {
        const trackUrl = MUSIC_TRACKS[type];
        
        // Если мы уже играем этот трек
        if (this.currentTrack === trackUrl) {
            if (this.musicPlayer.paused && this.musicPlayer.readyState >= 2) {
                try {
                    await this.musicPlayer.play();
                } catch (e) {
                    console.log("Resume music blocked, waiting for interaction");
                }
            }
            return;
        }

        // Смена трека
        this.currentTrack = trackUrl;
        this.musicPlayer.src = trackUrl;
        this.musicPlayer.volume = this.musicVolume;
        
        try {
            await this.musicPlayer.play();
        } catch (e) {
            // Autoplay policy or network error
            // We suppress the error to avoid spamming console, 
            // user interaction elsewhere will trigger resume logic if needed
            console.log("Music autoplay prevented or failed:", e);
        }
    }

    pauseMusic() {
        this.musicPlayer.pause();
    }

    resumeMusic() {
        if (this.currentTrack && this.musicPlayer.paused) {
            this.musicPlayer.play().catch(e => console.log("Resume failed silently", e));
        }
    }

    stopMusic() {
        this.musicPlayer.pause();
        this.currentTrack = null;
    }

    playSfx(type: 'ATTACK' | 'HIT' | 'START' | 'CLICK') {
        // Try to initialize if not already done
        if (!this.initialized) this.initialize();
        
        if (!this.audioContext || this.sfxVolume <= 0) return;

        // Ensure context is running (it might be suspended by browser policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(() => {});
        }

        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        const now = ctx.currentTime;
        
        switch (type) {
            case 'ATTACK':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
                gainNode.gain.setValueAtTime(this.sfxVolume, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
            case 'HIT':
                osc.type = 'square';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
                gainNode.gain.setValueAtTime(this.sfxVolume, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case 'START':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.linearRampToValueAtTime(600, now + 0.5);
                gainNode.gain.setValueAtTime(this.sfxVolume * 0.5, now);
                gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
                break;
            case 'CLICK':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                gainNode.gain.setValueAtTime(this.sfxVolume * 0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
                break;
        }
    }
}

export const audioManager = new AudioManager();
