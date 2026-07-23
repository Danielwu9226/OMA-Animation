import pygame
import math
import random
import sys
import array
import io
import hashlib

# Sound System Configuration & Synthesis
SOUNDS = {}
MIXER_AVAILABLE = False
SOUND_MUTED = False

def generate_sound(samples):
    if not MIXER_AVAILABLE:
        return None
    try:
        return pygame.mixer.Sound(buffer=samples.tobytes())
    except Exception:
        return None

def init_sound_system():
    global MIXER_AVAILABLE
    try:
        # Pre-init mixer to 22050 Hz, 16-bit, 2 channels (stereo) for music compatibility
        pygame.mixer.pre_init(22050, -16, 2)
        # Verify the module is actually functional (may be missing on some builds)
        _ = pygame.mixer.Sound
        MIXER_AVAILABLE = True
    except (ImportError, NotImplementedError, AttributeError):
        MIXER_AVAILABLE = False
        return

    sample_rate = 22050

    # 1. Paddle bounce sound (rising sweep)
    bounce_samples = array.array('h')
    for i in range(int(sample_rate * 0.08)):
        t = i / sample_rate
        freq = 180 + 220 * t
        val = int(14000 * math.sin(2 * math.pi * freq * t))
        bounce_samples.append(val)
    SOUNDS['bounce'] = generate_sound(bounce_samples)

    # 2. Wall bounce sound (short high sweep)
    wall_samples = array.array('h')
    for i in range(int(sample_rate * 0.04)):
        t = i / sample_rate
        val = int(10000 * math.sin(2 * math.pi * 140 * t))
        wall_samples.append(val)
    SOUNDS['wall'] = generate_sound(wall_samples)

    # 3. Brick hit sounds (5 pitch steps, one for each row)
    freqs = [440.00, 392.00, 329.63, 293.66, 261.63]
    for r in range(5):
        brick_samples = array.array('h')
        duration = 0.07
        freq = freqs[r]
        for i in range(int(sample_rate * duration)):
            t = i / sample_rate
            env = 1.0 - t / duration
            val = int(12000 * env * math.sin(2 * math.pi * freq * t))
            brick_samples.append(val)
        SOUNDS[f'brick_{r}'] = generate_sound(brick_samples)

    # 4. Power-up spawn sound (rising sci-fi chirp)
    spawn_samples = array.array('h')
    duration = 0.18
    for i in range(int(sample_rate * duration)):
        t = i / sample_rate
        freq = 300 + 400 * t
        env = 1.0 - t / duration
        val = int(9000 * env * (math.sin(2 * math.pi * freq * t) + 0.3 * math.sin(2 * math.pi * freq * 2 * t)))
        spawn_samples.append(val)
    SOUNDS['spawn'] = generate_sound(spawn_samples)

    # 5. Power-up shrink sound (descending sweep)
    shrink_samples = array.array('h')
    duration = 0.22
    for i in range(int(sample_rate * duration)):
        t = i / sample_rate
        freq = 550 - 250 * t
        env = 1.0 - t / duration
        val = int(12000 * env * math.sin(2 * math.pi * freq * t))
        shrink_samples.append(val)
    SOUNDS['shrink'] = generate_sound(shrink_samples)

    # 6. Power-up grow sound (triumphant rising chord)
    grow_samples = array.array('h')
    duration = 0.25
    for i in range(int(sample_rate * duration)):
        t = i / sample_rate
        freq = 300 + 500 * (t ** 2)
        env = 1.0 - t / duration
        val = int(10000 * env * (math.sin(2 * math.pi * freq * t) + 0.4 * math.sin(2 * math.pi * freq * 1.5 * t)))
        grow_samples.append(val)
    SOUNDS['grow'] = generate_sound(grow_samples)

    # 7. Death sound (buzzing descend)
    death_samples = array.array('h')
    duration = 0.45
    for i in range(int(sample_rate * duration)):
        t = i / sample_rate
        freq = 180 - 130 * t
        sine = math.sin(2 * math.pi * freq * t)
        square = 1.0 if sine > 0 else -1.0
        env = 1.0 - t / duration
        val = int(10000 * env * (sine * 0.6 + square * 0.4))
        death_samples.append(val)
    SOUNDS['death'] = generate_sound(death_samples)

    # 8. Victory sound (arpeggio sequence)
    victory_samples = array.array('h')
    duration = 0.7
    for i in range(int(sample_rate * duration)):
        t = i / sample_rate
        note_idx = int(t * 8.5)
        chord_freqs = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]
        freq = chord_freqs[min(note_idx, 6)]
        env = 1.0 - (t % 0.15) / 0.15
        val = int(11000 * env * math.sin(2 * math.pi * freq * t))
        victory_samples.append(val)
    SOUNDS['victory'] = generate_sound(victory_samples)

    # 9. Thunder crack (noise burst + low rumble decay)
    thunder_samples = array.array('h')
    t_dur = 0.9
    for i in range(int(sample_rate * t_dur)):
        t = i / sample_rate
        env = math.exp(-t * 4.5)
        noise = random.uniform(-1, 1)
        rumble = math.sin(2 * math.pi * 35 * t) * 0.5
        val = int(15000 * env * (noise * 0.55 + rumble))
        thunder_samples.append(max(-32767, min(32767, val)))
    SOUNDS['thunder'] = generate_sound(thunder_samples)

    # 10. Fanfare jingle (cheerful ascending arpeggio for paddle grow)
    fanfare_samples = array.array('h')
    notes_seq = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]
    note_dur_f = 0.07
    total_fanfare = len(notes_seq) * note_dur_f
    for i in range(int(sample_rate * total_fanfare)):
        t = i / sample_rate
        n_idx = int(t / note_dur_f)
        freq = notes_seq[min(n_idx, len(notes_seq) - 1)]
        t_in = t - n_idx * note_dur_f
        env = 1.0 - t_in / note_dur_f
        val = int(11000 * env * (math.sin(2 * math.pi * freq * t) + 0.35 * math.sin(2 * math.pi * freq * 2 * t)))
        fanfare_samples.append(max(-32767, min(32767, val)))
    SOUNDS['fanfare'] = generate_sound(fanfare_samples)

    # 11. Explosion boom (multiball trigger)
    explosion_samples = array.array('h')
    exp_dur = 0.6
    for i in range(int(sample_rate * exp_dur)):
        t = i / sample_rate
        env = math.exp(-t * 6)
        noise = random.uniform(-1, 1)
        sub = math.sin(2 * math.pi * 60 * t) * 0.6
        mid = math.sin(2 * math.pi * 120 * t) * 0.3
        val = int(16000 * env * (noise * 0.4 + sub + mid))
        explosion_samples.append(max(-32767, min(32767, val)))
    SOUNDS['explosion'] = generate_sound(explosion_samples)

    # 12. Metal clank (partial hit on armored brick)
    clank_samples = array.array('h')
    clank_dur = 0.18
    for i in range(int(sample_rate * clank_dur)):
        t = i / sample_rate
        env = math.exp(-t * 22)
        val = int(13000 * env * (math.sin(2 * math.pi * 820 * t) * 0.6
                                + math.sin(2 * math.pi * 1250 * t) * 0.4))
        clank_samples.append(max(-32767, min(32767, val)))
    SOUNDS['clank'] = generate_sound(clank_samples)

    # 13. Mario hit (coin/bump)
    mario_hit_samples = array.array('h')
    for i in range(int(sample_rate * 0.15)):
        t = i / sample_rate
        env = math.exp(-t * 15)
        freq = 900 + 300 * (t / 0.15)
        val = int(12000 * env * (math.sin(2 * math.pi * freq * t) > 0) * 0.5)
        mario_hit_samples.append(max(-32767, min(32767, val)))
    SOUNDS['mario_hit'] = generate_sound(mario_hit_samples)

    # 14. Pause Music loop (relaxing synth arpeggio)
    pause_samples = array.array('h')
    p_dur = 2.0  # 2 second loop
    for i in range(int(sample_rate * p_dur)):
        t = i / sample_rate
        note_idx = int(t * 4) % 4
        chord_freqs = [261.63, 329.63, 392.00, 523.25]
        freq = chord_freqs[note_idx]
        env = 1.0 - (t % 0.25) / 0.25
        val = int(8000 * env * math.sin(2 * math.pi * freq * t))
        pause_samples.append(val)
    SOUNDS['pause_music'] = generate_sound(pause_samples)

    # 15. Evil Laugh (muhahaha)
    laugh_samples = array.array('h')
    laugh_dur = 3.0
    for i in range(int(sample_rate * laugh_dur)):
        t = i / sample_rate
        env = 0.5 + 0.5 * math.sin(2 * math.pi * 5 * t)
        if t < 0.2: env *= t / 0.2
        if t > 2.5: env *= (3.0 - t) / 0.5
        freq = 150 - 20 * t + 10 * math.sin(2 * math.pi * 5 * t)
        tone = math.sin(2 * math.pi * freq * t)
        noise = random.uniform(-1, 1) * 0.3
        val = int(14000 * env * (tone + noise))
        laugh_samples.append(max(-32767, min(32767, val)))
    SOUNDS['laugh'] = generate_sound(laugh_samples)

def play_sound(name):
    if MIXER_AVAILABLE and not SOUND_MUTED and name in SOUNDS and SOUNDS[name] is not None:
        try:
            SOUNDS[name].play()
        except Exception:
            pass

# Initialize pygame and sound system
init_sound_system()

# Load real evil laugh if present
if MIXER_AVAILABLE:
    try:
        SOUNDS['laugh'] = pygame.mixer.Sound("src/soundtracks/evil_laugh.mp3")
    except:
        pass

print("--------------------------------------------------")
print("  N E O N   B R E A K E R   -   M A O M I   E D I T I O N  ")
print("--------------------------------------------------")
password = input("Enter password to unlock secure assets (or press Enter to skip): ")

pygame.init()

# --- Background Music ---
BG_MUSIC_FILE = 'src/soundtracks/mario_theme.mp3'  # Place this file in the same folder as this script
try:
    pygame.mixer.music.load(BG_MUSIC_FILE)
    pygame.mixer.music.set_volume(0.4)  # 40% volume so SFX stay audible
    pygame.mixer.music.play(-1)         # -1 = loop forever
except (pygame.error, FileNotFoundError, NotImplementedError, AttributeError) as e:
    print(f"[Music] Background music unavailable: {e}")

# Viewport configuration
WIDTH = 800
HEIGHT = 600
screen = pygame.display.set_mode((WIDTH, HEIGHT), pygame.FULLSCREEN | pygame.SCALED)
pygame.display.set_caption("NEON BREAKER - Retro Synthwave Arcade")


try:
    if password:
        with open("maomi.enc", "rb") as f:
            data = f.read()
        key = hashlib.sha256(password.encode('utf-8')).digest()
        decrypted = bytearray(len(data))
        for i in range(len(data)):
            decrypted[i] = data[i] ^ key[i % len(key)]
        MAOMI_IMG = pygame.image.load(io.BytesIO(decrypted)).convert_alpha()
    else:
        raise Exception("Skipped secure load")
        
    iw, ih = MAOMI_IMG.get_size()
    scale = min((WIDTH * 0.85) / iw, (HEIGHT * 0.85) / ih)
    MAOMI_IMG = pygame.transform.smoothscale(MAOMI_IMG, (int(iw * scale), int(ih * scale)))
except:
    MAOMI_IMG = pygame.Surface((WIDTH, HEIGHT))
    MAOMI_IMG.fill((100, 0, 0))

# --- Custom 5x5 Vector Font (Aesthetic Retro-Wave) ---
# Each character is defined by 5 rows of 5-bit numbers (0b00000 to 0b11111)

FONT_5X5 = {
    'A': [14, 17, 31, 17, 17],  # .xxx. / x...x / xxxxx / x...x / x...x
    'B': [30, 17, 30, 17, 30],  # xxxx. / x...x / xxxx. / x...x / xxxx.
    'C': [14, 16, 16, 16, 14],  # .xxx. / x.... / x.... / x.... / .xxx.
    'D': [28, 18, 18, 18, 28],  # xxx.. / x..x. / x..x. / x..x. / xxx..
    'E': [31, 16, 30, 16, 31],  # xxxxx / x.... / xxxx. / x.... / xxxxx
    'F': [31, 16, 30, 16, 16],  # xxxxx / x.... / xxxx. / x.... / x....
    'G': [14, 16, 23, 17, 14],  # .xxx. / x.... / x.xxx / x...x / .xxx.
    'H': [17, 17, 31, 17, 17],  # x...x / x...x / xxxxx / x...x / x...x
    'I': [14,  4,  4,  4, 14],  # .xxx. / ..x.. / ..x.. / ..x.. / .xxx.
    'J': [15,  2,  2, 18, 12],  # .xxxx / ...x. / ...x. / x..x. / .xx..
    'K': [17, 18, 28, 18, 17],  # x...x / x..x. / xxx.. / x..x. / x...x
    'L': [16, 16, 16, 16, 31],  # x.... / x.... / x.... / x.... / xxxxx
    'M': [17, 27, 21, 17, 17],  # x...x / xx.xx / x.x.x / x...x / x...x
    'N': [17, 25, 21, 19, 17],  # x...x / xx..x / x.x.x / x..xx / x...x
    'O': [14, 17, 17, 17, 14],  # .xxx. / x...x / x...x / x...x / .xxx.
    'P': [30, 17, 30, 16, 16],  # xxxx. / x...x / xxxx. / x.... / x....
    'Q': [14, 17, 21, 18, 13],  # .xxx. / x...x / x.x.x / x..x. / .xx.x
    'R': [30, 17, 30, 18, 17],  # xxxx. / x...x / xxxx. / x..x. / x...x
    'S': [15, 16, 14,  1, 30],  # .xxxx / x.... / .xxx. / ....x / xxxx.
    'T': [31,  4,  4,  4,  4],  # xxxxx / ..x.. / ..x.. / ..x.. / ..x..
    'U': [17, 17, 17, 17, 14],  # x...x / x...x / x...x / x...x / .xxx.
    'V': [17, 17, 17, 10,  4],  # x...x / x...x / x...x / .x.x. / ..x..
    'W': [17, 17, 21, 27, 17],  # x...x / x...x / x.x.x / xx.xx / x...x
    'X': [17, 10,  4, 10, 17],  # x...x / .x.x. / ..x.. / .x.x. / x...x
    'Y': [17, 17, 10,  4,  4],  # x...x / x...x / .x.x. / ..x.. / ..x..
    'Z': [31,  2,  4,  8, 31],  # xxxxx / ...x. / ..x.. / .x... / xxxxx
    '0': [14, 17, 21, 17, 14],  # .xxx. / x...x / x.x.x / x...x / .xxx.
    '1': [ 4, 12,  4,  4, 14],  # ..x.. / .xx.. / ..x.. / ..x.. / .xxx.
    '2': [14, 17,  2,  4, 31],  # .xxx. / x...x / ...x. / ..x.. / xxxxx
    '3': [14,  1, 14,  1, 14],  # .xxx. / ....x / .xxx. / ....x / .xxx.
    '4': [17, 17, 31,  1,  1],  # x...x / x...x / xxxxx / ....x / ....x
    '5': [31, 16, 30,  1, 30],  # xxxxx / x.... / xxxx. / ....x / xxxx.
    '6': [14, 16, 30, 17, 14],  # .xxx. / x.... / xxxx. / x...x / .xxx.
    '7': [31,  2,  4,  8, 16],  # xxxxx / ...x. / ..x.. / .x... / x....
    '8': [14, 17, 14, 17, 14],  # .xxx. / x...x / .xxx. / x...x / .xxx.
    '9': [14, 17, 15,  1, 14],  # .xxx. / x...x / .xxxx / ....x / .xxx.
    ' ': [ 0,  0,  0,  0,  0],  # Empty space
    ':': [ 0,  4,  0,  4,  0],  # Double dot
    '+': [ 0,  4, 14,  4,  0],  # Plus symbol
    '-': [ 0,  0, 14,  0,  0],  # Minus symbol
    '%': [17,  2,  4,  8, 17],  # Percent symbol
    '.': [ 0,  0,  0,  0,  4],  # Dot symbol
    '/': [ 2,  4,  4,  8,  8],  # Forward slash
    '!': [ 4,  4,  4,  0,  4],  # Exclamation mark
    '(': [ 6,  8,  8,  8,  6],  # Left parenthesis
    ')': [12,  2,  2,  2, 12],  # Right parenthesis
}

def draw_char_direct(surface, char, x, y, pixel_size, color):
    char = char.upper()
    bitmap = FONT_5X5.get(char, FONT_5X5[' '])
    for r in range(5):
        row_val = bitmap[r]
        for c in range(5):
            if (row_val >> (4 - c)) & 1:
                pygame.draw.rect(surface, color, (x + c * pixel_size, y + r * pixel_size, pixel_size, pixel_size))

def draw_string(surface, text, x, y, pixel_size, color, spacing=1):
    curr_x = x
    for char in text:
        draw_char_direct(surface, char, curr_x, y, pixel_size, color)
        curr_x += (5 + spacing) * pixel_size

def draw_glow_string(surface, text, x, y, pixel_size, text_color, glow_color, frequency=0):
    # Calculate pulsing intensity if frequency is set
    glow_alpha = 100
    if frequency > 0:
        glow_alpha = int(110 + 90 * math.sin(pygame.time.get_ticks() * 0.001 * frequency))
        
    # Draw glow backing (blurred duplicate)
    glow_surf = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
    for dx in [-1, 0, 1]:
        for dy in [-1, 0, 1]:
            if dx == 0 and dy == 0:
                continue
            draw_string(glow_surf, text, x + dx * pixel_size, y + dy * pixel_size, pixel_size, (*glow_color, glow_alpha))
    surface.blit(glow_surf, (0, 0))
    
    # Draw sharp core text
    draw_string(surface, text, x, y, pixel_size, text_color)

def get_string_width(text, pixel_size, spacing=1):
    if not text:
        return 0
    return (len(text) * (5 + spacing) - spacing) * pixel_size

def draw_centered_string(surface, text, center_x, y, pixel_size, text_color):
    w = get_string_width(text, pixel_size)
    draw_string(surface, text, center_x - w // 2, y, pixel_size, text_color)

def draw_centered_glow_string(surface, text, center_x, y, pixel_size, text_color, glow_color, frequency=0):
    w = get_string_width(text, pixel_size)
    draw_glow_string(surface, text, center_x - w // 2, y, pixel_size, text_color, glow_color, frequency)

# --- Neon Palette (Synthwave Aesthetic) ---
COLOR_BG = (11, 13, 25)         # Deep space indigo
COLOR_GRID = (32, 22, 56)       # Neon violet grid lines
COLOR_HORIZON = (244, 63, 94)   # Sunburst Pink
COLOR_PADDLE = (6, 182, 212)    # Electric Cyan
COLOR_BALL = (251, 146, 60)     # Neon Sunset Orange
COLOR_TEXT = (255, 255, 255)    # White neon core
COLOR_GLOW = (168, 85, 247)     # Purple glow backing

# Brick Palette Gradient
BRICK_COLORS = [
    (244, 63, 94),   # Row 0: Sunset Pink
    (251, 146, 60),  # Row 1: Orange
    (253, 224, 71),  # Row 2: Neon Yellow
    (168, 85, 247),  # Row 3: Purple
    (6, 182, 212)    # Row 4: Electric Cyan
]
BRICK_POINTS = [100, 80, 60, 40, 20]

# --- Entity Definitions ---

class Particle:
    def __init__(self, x, y, color):
        self.x = x
        self.y = y
        self.color = color
        angle = random.uniform(0, 2 * math.pi)
        speed = random.uniform(2, 6)
        self.vx = math.cos(angle) * speed
        self.vy = math.sin(angle) * speed
        self.size = random.uniform(3, 5)
        self.alpha = 255
        
    def update(self, dt):
        self.x += self.vx * dt
        self.y += self.vy * dt
        self.vx *= math.pow(0.95, dt)
        self.vy *= math.pow(0.95, dt)
        self.vy += 0.12 * dt  # Downward gravity
        self.alpha -= 5.5 * dt
        if self.alpha < 0:
            self.alpha = 0
            
    def draw(self, surface):
        if self.alpha <= 0:
            return
        p_surf = pygame.Surface((self.size * 2, self.size * 2), pygame.SRCALPHA)
        pygame.draw.circle(p_surf, (*self.color, int(self.alpha)), (self.size, self.size), self.size)
        surface.blit(p_surf, (int(self.x - self.size), int(self.y - self.size)))

class FloatingText:
    def __init__(self, x, y, text, color, size_scale=1):
        self.x = x
        self.y = y
        self.text = text
        self.color = color
        self.scale = size_scale
        self.vy = -1.5
        self.alpha = 255
        
    def update(self, dt):
        self.y += self.vy * dt
        self.alpha -= 5.0 * dt
        if self.alpha < 0:
            self.alpha = 0
            
    def draw(self, surface):
        if self.alpha <= 0:
            return
        # Calculate width
        w = get_string_width(self.text, self.scale)
        h = 5 * self.scale
        txt_surf = pygame.Surface((w, h), pygame.SRCALPHA)
        draw_string(txt_surf, self.text, 0, 0, self.scale, self.color)
        
        # Apply alpha fade
        alpha_surf = pygame.Surface((w, h), pygame.SRCALPHA)
        alpha_surf.fill((255, 255, 255, int(self.alpha)))
        txt_surf.blit(alpha_surf, (0, 0), special_flags=pygame.BLEND_RGBA_MULT)
        
        surface.blit(txt_surf, (int(self.x - w // 2), int(self.y - h // 2)))

class RetroGrid:
    def __init__(self, width, height):
        self.width = width
        self.height = height
        self.scroll_y = 0.0
        
    def update(self, dt):
        self.scroll_y = (self.scroll_y + 1.2 * dt) % 40
        
    def draw(self, surface):
        horizon_y = self.height * 0.45
        
        # Horizontal scrolling lines
        for i in range(15):
            y_offset = (i * 40 + self.scroll_y)
            norm_y = y_offset / 500.0
            if norm_y > 1.0:
                continue
            y = horizon_y + (self.height - horizon_y) * (norm_y ** 2)
            pygame.draw.line(surface, COLOR_GRID, (0, int(y)), (self.width, int(y)), 1)
            
        # Vanishing vertical perspective lines
        center_x = self.width // 2
        for x_offset in range(-800, 900, 80):
            start_x = center_x + x_offset
            end_x = center_x + int(x_offset * 0.15)
            pygame.draw.line(surface, COLOR_GRID, (start_x, self.height), (end_x, int(horizon_y)), 1)
            
        # Horizon gradient glow
        glow_h = 100
        glow_surf = pygame.Surface((self.width, glow_h), pygame.SRCALPHA)
        for y in range(glow_h):
            alpha = int(45 * (1.0 - y / glow_h))
            pygame.draw.line(glow_surf, (*COLOR_HORIZON, alpha), (0, y), (self.width, y))
        surface.blit(glow_surf, (0, int(horizon_y) - glow_h))

class Starfield:
    def __init__(self, width, height):
        self.stars = []
        for _ in range(50):
            self.stars.append({
                'x': random.randint(0, width),
                'y': random.randint(0, int(height * 0.45)),
                'size': random.uniform(0.8, 2.0),
                'brightness': random.randint(120, 255),
                'phase': random.uniform(0, 2 * math.pi)
            })
            
    def update(self, dt):
        for star in self.stars:
            star['phase'] += 0.045 * dt
            star['brightness'] = int(160 + 95 * math.sin(star['phase']))
            star['brightness'] = max(0, min(255, star['brightness']))
            
    def draw(self, surface):
        for star in self.stars:
            color = (star['brightness'], star['brightness'], star['brightness'])
            pygame.draw.circle(surface, color, (int(star['x']), int(star['y'])), int(star['size']))

class ScreenShake:
    def __init__(self):
        self.intensity = 0
        self.duration = 0
        
    def trigger(self, intensity, duration):
        self.intensity = intensity
        self.duration = duration
        
    def update(self, dt):
        if self.duration > 0:
            self.duration -= dt
            if self.duration <= 0:
                self.intensity = 0
                self.duration = 0
                
    def get_offset(self):
        if self.duration > 0:
            offset_x = random.randint(-self.intensity, self.intensity)
            offset_y = random.randint(-self.intensity, self.intensity)
            return offset_x, offset_y
        return 0, 0

class ScreenEffect:
    """Full-screen atmospheric effects: thunderstorm (shrink) and rainbow (grow)."""
    def __init__(self, width, height):
        self.width = width
        self.height = height
        self.active = None          # 'thunderstorm' or 'rainbow'
        self.timer = 0.0
        self.flash_alpha = 0.0
        self.lightning_bolts = []
        self.rain_drops = []
        self.sparkles = []
        self.next_lightning = 0.0

    def trigger(self, effect_type, heavy=False):
        self.active = effect_type
        self.timer = 0.0
        self.heavy = heavy
        self.flash_alpha = 200.0
        self.lightning_bolts = []
        self.rain_drops = []
        self.sparkles = []
        if effect_type == 'thunderstorm':
            self.next_lightning = 0.0
            for _ in range(120 if heavy else 90):
                self.rain_drops.append({
                    'x': random.uniform(0, self.width),
                    'y': random.uniform(-self.height, 0),
                    'speed': random.uniform(10, 18),
                    'length': random.randint(10, 22),
                    'alpha': random.randint(100, 180),
                })
        elif effect_type == 'rainbow':
            for _ in range(80):
                self.sparkles.append({
                    'x': random.uniform(0, self.width),
                    'y': random.uniform(0, self.height),
                    'color': (random.randint(160, 255), random.randint(160, 255), random.randint(60, 255)),
                    'size': random.uniform(2.0, 7.0),
                    'alpha': float(random.randint(180, 255)),
                    'vx': random.uniform(-2.5, 2.5),
                    'vy': random.uniform(-4.0, -0.5),
                    'life': random.uniform(60, 150),
                    'age': 0.0,
                })
        elif effect_type == 'explosion':
            # Radial burst from screen center
            cx = self.width // 2
            cy = self.height // 2
            explosion_colors = [(255, 200, 50), (255, 100, 30), (255, 255, 100),
                                 (255, 255, 255), (0, 230, 120), (255, 80, 80)]
            for _ in range(140):
                angle = random.uniform(0, 2 * math.pi)
                speed = random.uniform(4, 20)
                self.sparkles.append({
                    'x': float(cx),
                    'y': float(cy),
                    'color': random.choice(explosion_colors),
                    'size': random.uniform(3.0, 10.0),
                    'alpha': float(random.randint(210, 255)),
                    'vx': math.cos(angle) * speed,
                    'vy': math.sin(angle) * speed,
                    'life': random.uniform(25, 80),
                    'age': 0.0,
                })

    def _gen_lightning(self):
        start_x = random.randint(self.width // 5, 4 * self.width // 5)
        points = [(start_x, 55)]
        x, y = float(start_x), 55.0
        while y < self.height - 80:
            x = max(30, min(self.width - 30, x + random.randint(-50, 50)))
            y += random.randint(25, 55)
            points.append((int(x), int(y)))
        self.lightning_bolts.append({'points': points, 'alpha': 255.0})
        play_sound('thunder')

    def update(self, dt):
        if not self.active:
            return
        self.timer += dt
        self.flash_alpha = max(0.0, self.flash_alpha - 5.0 * dt)
        if self.active == 'thunderstorm':
            for drop in self.rain_drops:
                drop['y'] += drop['speed'] * dt
                if drop['y'] > self.height + 10:
                    drop['y'] = random.uniform(-40, 0)
                    drop['x'] = random.uniform(0, self.width)
            self.next_lightning -= dt
            if self.next_lightning <= 0:
                # generate 1 to 3 bolts if heavy
                for _ in range(random.randint(1, 3) if self.heavy else 1):
                    self._gen_lightning()
                self.next_lightning = random.uniform(5, 15) if self.heavy else random.uniform(45, 90)
                self.flash_alpha = 180.0
            for bolt in self.lightning_bolts:
                bolt['alpha'] = max(0.0, bolt['alpha'] - 12.0 * dt)
            self.lightning_bolts = [b for b in self.lightning_bolts if b['alpha'] > 0]
        elif self.active == 'rainbow':
            for sp in self.sparkles:
                sp['age'] += dt
                sp['x'] += sp['vx'] * dt
                sp['y'] += sp['vy'] * dt
                ratio = max(0.0, 1.0 - sp['age'] / sp['life'])
                sp['alpha'] = 255.0 * ratio
        elif self.active == 'explosion':
            for sp in self.sparkles:
                sp['age'] += dt
                sp['x'] += sp['vx'] * dt
                sp['y'] += sp['vy'] * dt
                sp['vy'] += 0.3 * dt  # Gravity
                sp['vx'] *= 0.97      # Air drag
                ratio = max(0.0, 1.0 - sp['age'] / sp['life'])
                sp['alpha'] = 255.0 * ratio
        if self.timer > 300:
            self.active = None

    def draw(self, surface):
        if not self.active:
            return
        if self.active == 'thunderstorm':
            storm_surf = pygame.Surface((self.width, self.height), pygame.SRCALPHA)
            storm_surf.fill((5, 15, 55, 90))
            surface.blit(storm_surf, (0, 0))
            if self.flash_alpha > 0:
                flash_surf = pygame.Surface((self.width, self.height), pygame.SRCALPHA)
                flash_surf.fill((200, 220, 255, int(self.flash_alpha * 0.45)))
                surface.blit(flash_surf, (0, 0))
            rain_surf = pygame.Surface((self.width, self.height), pygame.SRCALPHA)
            for drop in self.rain_drops:
                pygame.draw.line(rain_surf, (140, 170, 255, drop['alpha']),
                                 (int(drop['x']), int(drop['y'])),
                                 (int(drop['x'] - 3), int(drop['y'] + drop['length'])), 1)
            surface.blit(rain_surf, (0, 0))
            for bolt in self.lightning_bolts:
                if bolt['alpha'] > 0 and len(bolt['points']) > 1:
                    bolt_surf = pygame.Surface((self.width, self.height), pygame.SRCALPHA)
                    for j in range(len(bolt['points']) - 1):
                        a = int(bolt['alpha'])
                        pygame.draw.line(bolt_surf, (240, 240, 255, a),
                                         bolt['points'][j], bolt['points'][j + 1], 2)
                        pygame.draw.line(bolt_surf, (160, 180, 255, a // 3),
                                         bolt['points'][j], bolt['points'][j + 1], 5)
                    surface.blit(bolt_surf, (0, 0))
        elif self.active == 'rainbow':
            if self.flash_alpha > 0:
                flash_surf = pygame.Surface((self.width, self.height), pygame.SRCALPHA)
                flash_surf.fill((255, 230, 80, int(self.flash_alpha * 0.35)))
                surface.blit(flash_surf, (0, 0))
            sp_surf = pygame.Surface((self.width, self.height), pygame.SRCALPHA)
            for sp in self.sparkles:
                if sp['alpha'] > 0:
                    cx, cy = int(sp['x']), int(sp['y'])
                    r = max(1, int(sp['size']))
                    al = int(sp['alpha'])
                    col = (*sp['color'], al)
                    pygame.draw.circle(sp_surf, col, (cx, cy), r)
                    arm = int(sp['size'] * 2.5)
                    dim = (*sp['color'], al // 2)
                    pygame.draw.line(sp_surf, dim, (cx - arm, cy), (cx + arm, cy), 1)
                    pygame.draw.line(sp_surf, dim, (cx, cy - arm), (cx, cy + arm), 1)
            surface.blit(sp_surf, (0, 0))

        elif self.active == 'explosion':
            # Bright white blast flash
            if self.flash_alpha > 0:
                flash_surf = pygame.Surface((self.width, self.height), pygame.SRCALPHA)
                flash_surf.fill((255, 255, 255, int(self.flash_alpha * 0.6)))
                surface.blit(flash_surf, (0, 0))
            # Radial debris particles
            sp_surf = pygame.Surface((self.width, self.height), pygame.SRCALPHA)
            for sp in self.sparkles:
                if sp['alpha'] > 0:
                    cx, cy = int(sp['x']), int(sp['y'])
                    r = max(1, int(sp['size']))
                    al = int(sp['alpha'])
                    pygame.draw.circle(sp_surf, (*sp['color'], al), (cx, cy), r)
            surface.blit(sp_surf, (0, 0))

class PowerUp:
    def __init__(self, x, y, type_name):
        self.x = float(x)
        self.y = float(y)
        self.type = type_name # "fire", "superman", "speed", "split"
        self.vy = 3.0
        self.radius = 12
        
    def update(self, dt):
        self.y += self.vy * dt
        
    def draw(self, surface):
        if self.type == "fire":
            color = (251, 146, 60)
            glow_color = (244, 63, 94)
            char = 'F'
        elif self.type == "superman":
            color = (253, 224, 71)
            glow_color = (168, 85, 247)
            char = 'S'
        elif self.type == "speed":
            color = (244, 63, 94)  # Pink
            glow_color = (168, 85, 247)  # Purple
            char = 'U'  # Up (Speed up)
        elif self.type == "split":
            color = (253, 224, 71)  # Yellow
            glow_color = (251, 146, 60)  # Orange
            char = 'X'  # eXplosive / split
        elif self.type == "multiball":
            color = (0, 230, 120)       # Vivid green
            glow_color = (255, 220, 0)  # Gold glow
            char = 'M'
        elif self.type == "rocket":
            color = (255, 50, 50)       # Deep Red
            glow_color = (251, 146, 60) # Orange glow
            char = 'R'
        elif self.type == "builder":
            color = (100, 200, 255)
            glow_color = (50, 150, 255)
            char = 'B'
        else:
            color = (255, 255, 255)
            glow_color = COLOR_GLOW
            char = '?'
            
        if self.type == "builder":
            # Square blinking icon
            blink = (pygame.time.get_ticks() // 150) % 2 == 0
            alpha = 255 if blink else 100
            sq_surf = pygame.Surface((self.radius * 2, self.radius * 2), pygame.SRCALPHA)
            pygame.draw.rect(sq_surf, (*color, alpha), (0, 0, self.radius * 2, self.radius * 2), border_radius=3)
            pygame.draw.rect(sq_surf, (255, 255, 255, alpha), (0, 0, self.radius * 2, self.radius * 2), width=2, border_radius=3)
            draw_char_direct(sq_surf, char, self.radius - 5, self.radius - 5, 2, (255, 255, 255))
            surface.blit(sq_surf, (int(self.x - self.radius), int(self.y - self.radius)))
            return
            
        glow_expansion = 6
        glow_radius = self.radius + glow_expansion
        glow_surf = pygame.Surface((glow_radius * 2, glow_radius * 2), pygame.SRCALPHA)
        
        for r in range(glow_radius, self.radius, -2):
            ratio = (glow_radius - r) / glow_expansion
            alpha = int(120 * ratio)
            pygame.draw.circle(glow_surf, (*glow_color, alpha), (glow_radius, glow_radius), r)
            
        pygame.draw.circle(glow_surf, color, (glow_radius, glow_radius), self.radius)
        pygame.draw.circle(glow_surf, (255, 255, 255), (glow_radius, glow_radius), self.radius, width=2)
        
        draw_char_direct(glow_surf, char, glow_radius - 5, glow_radius - 5, 2, (255, 255, 255))
        
        surface.blit(glow_surf, (int(self.x - glow_radius), int(self.y - glow_radius)))

class RocketProjectile:
    def __init__(self, x, y):
        self.x = float(x)
        self.y = float(y)
        self.vy = 10.0
        self.width = 12
        self.height = 24
        
    def update(self, dt):
        self.y -= self.vy * dt
        
    def draw(self, surface):
        rect = pygame.Rect(int(self.x - self.width//2), int(self.y - self.height//2), self.width, self.height)
        pygame.draw.rect(surface, (255, 50, 50), rect, border_radius=4)
        pygame.draw.rect(surface, (251, 146, 60), rect, width=2, border_radius=4)
        flame_y = int(self.y + self.height//2)
        pygame.draw.polygon(surface, (255, 220, 0), [(int(self.x - 4), flame_y), (int(self.x + 4), flame_y), (int(self.x), flame_y + random.randint(5, 12))])

class Paddle:
    def __init__(self):
        # Constraint 1: Paddle is exactly 100 pixels wide
        self.width = 100
        self.height = 16
        self.rect = pygame.Rect(WIDTH // 2 - self.width // 2, HEIGHT - 50, self.width, self.height)
        self.rockets_held = 0
        
    def update(self):
        # Controlled by mouse
        mouse_x, _ = pygame.mouse.get_pos()
        
        # Keep track of old width to handle resizing nicely
        if self.rect.width != self.width:
            old_centerx = self.rect.centerx
            self.rect.width = self.width
            self.rect.centerx = old_centerx
            
        self.rect.centerx = mouse_x
        # Clamped inside window borders
        if self.rect.left < 0:
            self.rect.left = 0
        elif self.rect.right > WIDTH:
            self.rect.right = WIDTH
            
    def draw(self, surface):
        # Cyan neon glow effect
        glow_expansion = 10
        glow_w = self.width + glow_expansion * 2
        glow_h = self.height + glow_expansion * 2
        glow_surf = pygame.Surface((glow_w, glow_h), pygame.SRCALPHA)
        
        # Select paddle color based on state/width
        if self.width < 100:
            paddle_color = (251, 146, 60)  # Neon Sunset Orange (Fire)
        elif self.width > 100:
            paddle_color = (253, 224, 71)  # Neon Yellow (Superman)
        else:
            paddle_color = COLOR_PADDLE  # Electric Cyan
        
        # Soft outer boundary glow lines
        for i in range(glow_expansion, 0, -2):
            ratio = (glow_expansion - i) / glow_expansion
            glow_alpha = int(90 * ratio)
            temp_rect = pygame.Rect(i, i, self.width + (glow_expansion - i) * 2, self.height + (glow_expansion - i) * 2)
            pygame.draw.rect(glow_surf, (*paddle_color, glow_alpha), temp_rect, border_radius=6 + (glow_expansion - i))
            
        # Draw central solid paddle
        core_rect = pygame.Rect(glow_expansion, glow_expansion, self.width, self.height)
        pygame.draw.rect(glow_surf, (255, 255, 255), core_rect, border_radius=6)
        pygame.draw.rect(glow_surf, paddle_color, core_rect, width=3, border_radius=6)
        
        surface.blit(glow_surf, (self.rect.x - glow_expansion, self.rect.y - glow_expansion))
        
        if getattr(self, 'rockets_held', 0) > 0:
            count = self.rockets_held
            spacing = 16
            start_x = self.rect.centerx - ((count - 1) * spacing) / 2
            for i in range(count):
                rx = start_x + i * spacing
                r_rect = pygame.Rect(rx - 6, self.rect.top - 20, 12, 20)
                pygame.draw.rect(surface, (255, 50, 50), r_rect, border_radius=3)
                pygame.draw.rect(surface, (251, 146, 60), r_rect, width=1, border_radius=3)

class BallTrail:
    def __init__(self):
        self.points = []
        
    def update(self, x, y):
        self.points.append((x, y))
        if len(self.points) > 12:
            self.points.pop(0)
            
    def draw(self, surface):
        for i, pt in enumerate(self.points):
            alpha = int(120 * ((i + 1) / len(self.points)))
            radius = int(8 * ((i + 1) / len(self.points)))
            radius = max(1, radius)
            trail_surf = pygame.Surface((radius * 2, radius * 2), pygame.SRCALPHA)
            pygame.draw.circle(trail_surf, (*COLOR_BALL, alpha), (radius, radius), radius)
            surface.blit(trail_surf, (int(pt[0] - radius), int(pt[1] - radius)))

class Ball:
    def __init__(self):
        self.radius = 8
        self.x = 0.0
        self.y = 0.0
        self.vx = 0.0
        self.vy = 0.0
        self.speed = 6.0
        self.trail = BallTrail()
        self.launched = False
        
    def reset(self, paddle):
        self.x = float(paddle.rect.centerx)
        self.y = float(paddle.rect.top - self.radius - 2)
        self.vx = 0.0
        self.vy = 0.0
        self.speed = 6.0
        self.launched = False
        self.trail.points.clear()
        
    def launch(self):
        if not self.launched:
            angle = math.radians(random.uniform(-40, 40))
            self.vx = self.speed * math.sin(angle)
            self.vy = -self.speed * math.cos(angle)
            self.launched = True
            
    def update(self, dt, paddle, bricks, particles, floating_texts, screen_shake, powerups, can_spawn_multiball=True, can_spawn_rocket=True, can_spawn_builder=False):
        if not self.launched:
            self.x = paddle.rect.centerx
            self.y = paddle.rect.top - self.radius
            return True, False, False, False
            
        spawned_mb = False
        spawned_rocket = False
        spawned_builder = False

        # Sub-axis movement: X
        self.x += self.vx * dt
        
        # Wall collision
        if self.x - self.radius < 0:
            self.x = self.radius
            self.vx = -self.vx
            screen_shake.trigger(1, 4)
            play_sound('wall')
        elif self.x + self.radius > WIDTH:
            self.x = WIDTH - self.radius
            self.vx = -self.vx
            screen_shake.trigger(1, 4)
            play_sound('wall')
            
        # X-collision with paddle
        ball_rect = pygame.Rect(int(self.x - self.radius), int(self.y - self.radius), self.radius * 2, self.radius * 2)
        if ball_rect.colliderect(paddle.rect):
            if self.vx > 0:
                self.x = paddle.rect.left - self.radius
                self.vx = -self.vx
            elif self.vx < 0:
                self.x = paddle.rect.right + self.radius
                self.vx = -self.vx
            screen_shake.trigger(2, 5)
            play_sound('bounce')
                
        # X-collision with bricks
        ball_rect = pygame.Rect(int(self.x - self.radius), int(self.y - self.radius), self.radius * 2, self.radius * 2)
        for brick in list(bricks):
            if ball_rect.colliderect(brick.rect):
                if self.vx > 0:
                    self.x = brick.rect.left - self.radius
                elif self.vx < 0:
                    self.x = brick.rect.right + self.radius
                self.vx = -self.vx
                smb, srk, sb = self.handle_brick_hit(brick, bricks, particles, floating_texts, screen_shake, powerups, can_spawn_multiball, can_spawn_rocket, can_spawn_builder)
                spawned_mb = spawned_mb or smb
                spawned_rocket = spawned_rocket or srk
                spawned_builder = spawned_builder or sb
                break
                
        # Sub-axis movement: Y
        self.y += self.vy * dt
        
        # Top Wall collision (below HUD bar)
        if self.y - self.radius < 50:
            self.y = 50 + self.radius
            self.vy = -self.vy
            screen_shake.trigger(1, 4)
            play_sound('wall')
            
        # Y-collision with paddle
        ball_rect = pygame.Rect(int(self.x - self.radius), int(self.y - self.radius), self.radius * 2, self.radius * 2)
        if ball_rect.colliderect(paddle.rect):
            if self.vy > 0:
                self.y = paddle.rect.top - self.radius
                
                # Deflection angle dependent on contact point relative to paddle center
                hit_pos = self.x - paddle.rect.centerx
                half_w = paddle.rect.width / 2.0
                hit_pos = max(-half_w, min(half_w, hit_pos))
                pct = hit_pos / half_w
                max_angle = math.radians(65)
                angle = pct * max_angle
                
                speed_mag = math.hypot(self.vx, self.vy)
                self.vx = speed_mag * math.sin(angle)
                self.vy = -speed_mag * math.cos(angle)
                
                screen_shake.trigger(3, 6)
                play_sound('bounce')
                
        # Y-collision with bricks
        ball_rect = pygame.Rect(int(self.x - self.radius), int(self.y - self.radius), self.radius * 2, self.radius * 2)
        for brick in list(bricks):
            if ball_rect.colliderect(brick.rect):
                if self.vy > 0:
                    self.y = brick.rect.top - self.radius
                elif self.vy < 0:
                    self.y = brick.rect.bottom + self.radius
                self.vy = -self.vy
                smb, srk, sb = self.handle_brick_hit(brick, bricks, particles, floating_texts, screen_shake, powerups, can_spawn_multiball, can_spawn_rocket, can_spawn_builder)
                spawned_mb = spawned_mb or smb
                spawned_rocket = spawned_rocket or srk
                spawned_builder = spawned_builder or sb
                break
                
        # Lost ball check
        if self.y + self.radius > HEIGHT:
            return False, spawned_mb, spawned_rocket, spawned_builder
            
        return True, spawned_mb, spawned_rocket, spawned_builder
        
    def handle_brick_hit(self, brick, bricks, particles, floating_texts, screen_shake, powerups, can_spawn_multiball, can_spawn_rocket, can_spawn_builder):
        spawned_mb = False
        spawned_rocket = False
        spawned_builder = False
        # Always apply 5% speed boost on any brick contact
        self.vx *= 1.05
        self.vy *= 1.05
        self.speed = math.hypot(self.vx, self.vy)

        if brick.is_metal:
            brick.hits_remaining -= 1
            if brick.hits_remaining <= 0:
                bricks.remove(brick)
                for _ in range(18):
                    particles.append(Particle(brick.rect.centerx, brick.rect.centery, (175, 182, 200)))
                floating_texts.append(FloatingText(brick.rect.centerx, brick.rect.centery,
                                                   f"+{brick.points}", (210, 220, 240), size_scale=2))
                floating_texts.append(FloatingText(brick.rect.centerx, brick.rect.centery - 14,
                                                   "+5% SPEED", (253, 224, 71), size_scale=1))
                play_sound('mario_hit')
                screen_shake.trigger(6, 10)
                if len(powerups) < 4 and random.random() < 0.20:
                    choices = ["fire", "superman"]
                    if can_spawn_multiball: choices.append("multiball")
                    if can_spawn_rocket: choices.append("rocket")
                    if can_spawn_builder: choices.append("builder")
                    pu_type = random.choice(choices)
                    powerups.append(PowerUp(brick.rect.centerx, brick.rect.centery, pu_type))
                    if pu_type == "multiball": spawned_mb = True
                    if pu_type == "rocket": spawned_rocket = True
                    if pu_type == "builder": spawned_builder = True
                    play_sound('spawn')
            else:
                for _ in range(7):
                    particles.append(Particle(brick.rect.centerx, brick.rect.centery, (210, 218, 235)))
                floating_texts.append(FloatingText(brick.rect.centerx, brick.rect.centery,
                                                   "CLANK!", (180, 195, 220), size_scale=1))
                play_sound('clank')
                screen_shake.trigger(2, 4)
        else:
            bricks.remove(brick)
            for _ in range(12):
                particles.append(Particle(brick.rect.centerx, brick.rect.centery, brick.color))
            floating_texts.append(FloatingText(brick.rect.centerx, brick.rect.centery,
                                               f"+{brick.points}", brick.color, size_scale=2))
            floating_texts.append(FloatingText(brick.rect.centerx, brick.rect.centery - 14,
                                               "+5% SPEED", (253, 224, 71), size_scale=1))
            play_sound('mario_hit')
            if len(powerups) < 4 and random.random() < 0.25:
                choices = ["fire", "superman"]
                if can_spawn_multiball: choices.append("multiball")
                if can_spawn_rocket: choices.append("rocket")
                if can_spawn_builder: choices.append("builder")
                pu_type = random.choice(choices)
                powerups.append(PowerUp(brick.rect.centerx, brick.rect.centery, pu_type))
                if pu_type == "multiball": spawned_mb = True
                if pu_type == "rocket": spawned_rocket = True
                if pu_type == "builder": spawned_builder = True
                play_sound('spawn')
            screen_shake.trigger(4, 7)
            
        return spawned_mb, spawned_rocket, spawned_builder
        
    def draw(self, surface):
        self.trail.draw(surface)
        
        # Glowing sunset ball shape
        glow_radius = 18
        glow_surf = pygame.Surface((glow_radius * 2, glow_radius * 2), pygame.SRCALPHA)
        
        for r in range(glow_radius, self.radius, -2):
            ratio = (glow_radius - r) / (glow_radius - self.radius)
            glow_alpha = int(100 * ratio)
            pygame.draw.circle(glow_surf, (*COLOR_BALL, glow_alpha), (glow_radius, glow_radius), r)
            
        pygame.draw.circle(glow_surf, (255, 255, 255), (glow_radius, glow_radius), self.radius)
        pygame.draw.circle(glow_surf, COLOR_BALL, (glow_radius, glow_radius), self.radius - 2)
        
        surface.blit(glow_surf, (int(self.x - glow_radius), int(self.y - glow_radius)))

class Brick:
    def __init__(self, x, y, width, height, color, points, hits_required=1, is_metal=False):
        self.rect = pygame.Rect(x, y, width, height)
        self.color = color
        self.points = points
        self.hits_required = hits_required
        self.hits_remaining = hits_required
        self._is_metal = is_metal or (hits_required > 1)

    @property
    def is_metal(self):
        return self._is_metal

    def draw(self, surface):
        if self.is_metal:
            self._draw_metal(surface)
        else:
            self._draw_normal(surface)

    def _draw_normal(self, surface):
        pygame.draw.rect(surface, self.color, self.rect, border_radius=4)
        highlight = tuple(min(255, c + 60) for c in self.color)
        pygame.draw.rect(surface, highlight, self.rect, width=1, border_radius=4)
        shine_r = pygame.Rect(self.rect.x + 2, self.rect.y + 2, self.rect.width - 4, self.rect.height // 3)
        shine_surf = pygame.Surface((shine_r.width, shine_r.height), pygame.SRCALPHA)
        pygame.draw.rect(shine_surf, (255, 255, 255, 30), (0, 0, shine_r.width, shine_r.height), border_radius=2)
        surface.blit(shine_surf, shine_r.topleft)

    def _draw_metal(self, surface):
        ratio = self.hits_remaining / self.hits_required
        if ratio > 0.66:
            base  = (172, 178, 192)
            shine = (218, 224, 236)
        elif ratio > 0.33:
            base  = (135, 142, 156)
            shine = (175, 182, 196)
        else:
            base  = (96,  103, 118)
            shine = (135, 142, 156)
        pygame.draw.rect(surface, base, self.rect, border_radius=4)
        pygame.draw.rect(surface, shine, self.rect, width=2, border_radius=4)
        shine_r = pygame.Rect(self.rect.x + 3, self.rect.y + 2,
                              max(1, self.rect.width - 6), max(1, self.rect.height // 3))
        s_surf = pygame.Surface((shine_r.width, shine_r.height), pygame.SRCALPHA)
        pygame.draw.rect(s_surf, (255, 255, 255, 55), (0, 0, shine_r.width, shine_r.height), border_radius=2)
        surface.blit(s_surf, shine_r.topleft)
        # Crack lines for damaged bricks
        cx, cy = self.rect.centerx, self.rect.centery
        if self.hits_remaining < self.hits_required:
            cc = (42, 48, 58)
            pygame.draw.line(surface, cc, (cx - 7, cy - 4), (cx + 5, cy + 6), 1)
            if self.hits_remaining == 1:
                pygame.draw.line(surface, cc, (cx + 4, cy - 7), (cx - 4, cy + 5), 1)
        # Hit counter
        draw_centered_string(surface, str(self.hits_remaining), cx, cy - 8, 3, (255, 255, 150))

# --- Drawing Utilities & Layout Helpers ---

def get_letter_pattern(char):
    # A simple 3x5 font map
    font = {
        '0': ["111", "101", "101", "101", "111"],
        '1': ["010", "110", "010", "010", "111"],
        '2': ["111", "001", "111", "100", "111"],
        '3': ["111", "001", "111", "001", "111"],
        '4': ["101", "101", "111", "001", "001"],
        '5': ["111", "100", "111", "001", "111"],
        '6': ["111", "100", "111", "101", "111"],
        '7': ["111", "001", "010", "010", "010"],
        '8': ["111", "101", "111", "101", "111"],
        '9': ["111", "101", "111", "001", "111"],
        'T': ["111", "010", "010", "010", "010"],
        'H': ["101", "101", "111", "101", "101"],
        'R': ["110", "101", "110", "101", "101"],
        'E': ["111", "100", "111", "100", "111"],
        'F': ["111", "100", "111", "100", "100"],
        'O': ["111", "101", "101", "101", "111"],
        'U': ["101", "101", "101", "101", "111"],
        'S': ["111", "100", "111", "001", "111"],
        'I': ["111", "010", "010", "010", "111"],
        'X': ["101", "101", "010", "101", "101"],
        'V': ["101", "101", "101", "101", "010"],
        'N': ["101", "111", "101", "101", "101"],
    }
    return font.get(char, font['E'])

def build_bricks(level=1):
    bricks = []
    
    if level < 3:
        cols = 10
        rows = 5 if level == 1 else 7
        brick_w = 68
        brick_h = 22
        gap_x = 4
        gap_y = 4
        
        total_w = cols * brick_w + (cols - 1) * gap_x
        start_x = (WIDTH - total_w) // 2
        start_y = 90
        
        for r in range(rows):
            color = BRICK_COLORS[r % len(BRICK_COLORS)]
            points = BRICK_POINTS[r % len(BRICK_POINTS)]
            for c in range(cols):
                x = start_x + c * (brick_w + gap_x)
                y = start_y + r * (brick_h + gap_y)
                bricks.append(Brick(x, y, brick_w, brick_h, color, points))

        if level >= 2:
            metal_y = start_y + rows * (brick_h + gap_y)
            metal_w = 3 * brick_w + 2 * gap_x
            m_start_x = (WIDTH - metal_w) // 2
            for i in range(3):
                x = m_start_x + i * (brick_w + gap_x)
                bricks.append(Brick(x, metal_y, brick_w, brick_h, (172, 178, 192), 200, hits_required=3, is_metal=True))
    else:
        # Dynamic Text Grid for Level 3+
        words = {3: "THREE", 4: "FOURTH", 5: "FIFTH", 6: "SIXTH", 7: "SEVENTH", 8: "EIGHTH", 9: "NINTH"}
        word = words.get(level, "SURVIVE")
        
        # 3 cols per letter + 1 gap col between letters
        cols = len(word) * 3 + (len(word) - 1)
        rows = 5
        
        gap_x = 2
        gap_y = 4
        # Calculate brick size based on cols to fit in roughly 700px width
        brick_w = max(10, (700 - (cols - 1) * gap_x) // cols)
        brick_h = 22
        
        total_w = cols * brick_w + (cols - 1) * gap_x
        start_x = (WIDTH - total_w) // 2
        start_y = 90
        
        for i, char in enumerate(word):
            pattern = get_letter_pattern(char)
            # Starting col for this letter
            char_col_start = i * 4
            for r in range(rows):
                color = BRICK_COLORS[r % len(BRICK_COLORS)]
                points = BRICK_POINTS[r % len(BRICK_POINTS)]
                row_pat = pattern[r]
                for cc in range(3):
                    if row_pat[cc] == '1':
                        actual_col = char_col_start + cc
                        x = start_x + actual_col * (brick_w + gap_x)
                        y = start_y + r * (brick_h + gap_y)
                        bricks.append(Brick(x, y, brick_w, brick_h, color, points))
                        
        # Hits scale with level (level+1)
        metal_hp = level + 1
        
        if level > 5:
            # Place in random empty areas
            empty_spots = []
            for r in range(rows + 4): # expand the grid vertically
                for c in range(cols):
                    bx = start_x + c * (brick_w + gap_x)
                    by = start_y + r * (brick_h + gap_y)
                    temp_rect = pygame.Rect(bx, by, brick_w, brick_h)
                    if not any(br.rect.colliderect(temp_rect) for br in bricks):
                        empty_spots.append((bx, by))
            
            chosen_spots = random.sample(empty_spots, min(3, len(empty_spots)))
            for i, (bx, by) in enumerate(chosen_spots):
                hp = 3 if i < 2 else metal_hp
                bricks.append(Brick(bx, by, brick_w, brick_h, (172, 178, 192), 200, hits_required=hp, is_metal=True))
        else:
            # Add Metal Bricks underneath
            metal_y = start_y + rows * (brick_h + gap_y) + 20
            metal_w = 3 * brick_w + 2 * gap_x
            m_start_x = (WIDTH - metal_w) // 2
            for i in range(3):
                x = m_start_x + i * (brick_w + gap_x)
                bricks.append(Brick(x, metal_y, brick_w, brick_h, (172, 178, 192), 200, hits_required=metal_hp, is_metal=True))

    return bricks

def draw_hud(surface, score, lives, current_speed_mult, level=1):
    # Divider line
    pygame.draw.line(surface, COLOR_HORIZON, (0, 50), (WIDTH, 50), 2)
    # Line glow backing
    line_glow = pygame.Surface((WIDTH, 8), pygame.SRCALPHA)
    for y in range(8):
        alpha = int(45 * (1.0 - y / 8.0))
        pygame.draw.line(line_glow, (*COLOR_HORIZON, alpha), (0, y), (WIDTH, y))
    surface.blit(line_glow, (0, 51))
    
    # Score output
    score_str = f"SCORE:{score:05d}"
    draw_string(surface, score_str, 20, 16, 2, COLOR_TEXT)
    
    # Pause hint
    draw_string(surface, "P=PAUSE", 230, 16, 2, (180, 195, 220))
    
    # Level indicator
    draw_string(surface, f"LVL:{level}", 20, 5, 1, (168, 85, 247))

    # Speed multiplier (Constraint 2 visual verification)
    speed_pct = int((current_speed_mult - 1.0) * 100)
    speed_str = f"SPEED:+{speed_pct}%" if speed_pct > 0 else "SPEED:NORMAL"
    speed_color = (253, 224, 71) if speed_pct > 0 else COLOR_TEXT
    draw_centered_string(surface, speed_str, WIDTH // 2, 16, 2, speed_color)
    
    # Lives indicators (3 tiny vector paddles)
    draw_string(surface, "LIVES:", WIDTH - 180, 16, 2, COLOR_TEXT)
    for i in range(lives):
        px = WIDTH - 110 + i * 32
        py = 22
        pygame.draw.rect(surface, COLOR_PADDLE, (px, py, 22, 6), border_radius=2)
        pygame.draw.rect(surface, (255, 255, 255), (px + 2, py + 1, 18, 4), border_radius=1)

def draw_sound_toggle(surface):
    rect = pygame.Rect(WIDTH - 130, HEIGHT - 30, 120, 24)
    border_color = (6, 182, 212) if not SOUND_MUTED else (244, 63, 94)
    pygame.draw.rect(surface, COLOR_BG, rect, border_radius=4)
    pygame.draw.rect(surface, border_color, rect, width=2, border_radius=4)
    
    txt = "SOUND: OFF" if SOUND_MUTED else "SOUND: ON"
    color = (244, 63, 94) if SOUND_MUTED else (6, 182, 212)
    txt_w = get_string_width(txt, 1)
    draw_string(surface, txt, rect.centerx - txt_w // 2, rect.centery - 2, 1, color)

# --- Core Game Main ---

def main():
    clock = pygame.time.Clock()
    
    # Background animation controllers
    grid = RetroGrid(WIDTH, HEIGHT)
    starfield = Starfield(WIDTH, HEIGHT)
    shake = ScreenShake()
    screen_effect = ScreenEffect(WIDTH, HEIGHT)
    
    # Game objects
    paddle = Paddle()
    balls = [Ball()]           # Multi-ball list (normally 1 ball)
    balls[0].reset(paddle)
    multiball_timer = 0        # Countdown ticks; >0 means multiball active
    paddle_timer = 0           # Countdown ticks for paddle powerups
    shoot_blink_timer = 0
    bricks = build_bricks()
    
    # Visual entity containers
    particles = []
    floating_texts = []
    powerups = []
    active_rockets = []
    
    score = 0
    lives = 3
    total_deaths = 0
    player_name = ""
    maomi_timer = 0.0
    
    # Game states: START, PLAYING, PAUSED, GAME_OVER, VICTORY, LEVEL_TRANSITION, MAOMI_INTRO, RECORD_ENTRY, LEADERBOARD
    state = "START"
    level = 1
    leaderboard_data = []
    multiballs_dropped = 0
    rockets_dropped = 0
    transition_timer = 0
    
    # Main rendering canvas for offset screen shake blits
    canvas = pygame.Surface((WIDTH, HEIGHT))
    
    running = True
    while running:
        # Standardize 60 FPS delta ticks
        raw_tick = clock.tick(60)
        dt = raw_tick / 16.666
        # Cap dt to prevent object jumping through screens during severe lag
        dt = min(dt, 2.0)
        
        # --- Events ---
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
                
            elif event.type == pygame.MOUSEBUTTONDOWN:
                if state == "START":
                    state = "PLAYING"
                    lives = 3
                    score = 0
                    total_deaths = 0
                    multiballs_dropped = 0
                    rockets_dropped = 0
                    builders_dropped = 0
                    bricks = build_bricks(level)
                    paddle.width = 100
                    paddle.rect.width = 100
                    balls = [Ball()]
                    balls[0].reset(paddle)
                    multiball_timer = 0
                    paddle_timer = 0
                    shoot_blink_timer = 0
                    screen_effect.active = None
                    particles.clear()
                    floating_texts.clear()
                    powerups.clear()
                    active_rockets.clear()
                elif state == "PLAYING":
                    if balls and not balls[0].launched:
                        balls[0].launch()
                    elif getattr(paddle, 'rockets_held', 0) > 0:
                        paddle.rockets_held -= 1
                        active_rockets.append(RocketProjectile(paddle.rect.centerx, paddle.rect.top - 12))
                        play_sound('explosion')
                        shake.trigger(8, 12)
                elif state in ["GAME_OVER", "VICTORY", "LEADERBOARD"]:
                    state = "START"
                    screen_effect.active = None
                    try:
                        pygame.mixer.music.stop()
                        pygame.mixer.music.load('src/soundtracks/mario_theme.mp3')
                        pygame.mixer.music.set_volume(0.4)
                        pygame.mixer.music.play(-1)
                    except (pygame.error, FileNotFoundError, NotImplementedError, AttributeError):
                        pass
                    
            elif event.type == pygame.KEYDOWN:
                if state == "RECORD_ENTRY":
                    if event.key == pygame.K_RETURN and len(player_name) > 0:
                        try:
                            with open("records.txt", "a") as f:
                                f.write(f"{player_name},{score},{total_deaths}\n")
                        except Exception:
                            pass
                        state = "LEADERBOARD"
                        leaderboard_data = []
                        try:
                            with open("records.txt", "r") as f:
                                for line in f:
                                    parts = line.strip().split(',')
                                    if len(parts) == 3:
                                        leaderboard_data.append((parts[0], int(parts[1]), int(parts[2])))
                        except: pass
                        leaderboard_data.sort(key=lambda x: x[1], reverse=True)
                        leaderboard_data = leaderboard_data[:8]
                        
                        try:
                            pygame.mixer.music.stop()
                            pygame.mixer.music.load('src/soundtracks/mario_theme.mp3')
                            pygame.mixer.music.play(-1)
                        except: pass
                    elif event.key == pygame.K_BACKSPACE:
                        player_name = player_name[:-1]
                    elif event.unicode.isprintable() and len(player_name) < 15:
                        if event.unicode.upper() in FONT_5X5:
                            player_name += event.unicode.upper()
                elif event.key in [pygame.K_ESCAPE, pygame.K_p]:
                    if state == "PLAYING":
                        state = "PAUSED"
                        try:
                            pygame.mixer.music.pause()
                            if MIXER_AVAILABLE and not SOUND_MUTED and 'pause_music' in SOUNDS and SOUNDS['pause_music']:
                                SOUNDS['pause_music'].play(loops=-1)
                        except Exception: pass
                    elif state == "PAUSED":
                        state = "PLAYING"
                        try:
                            if MIXER_AVAILABLE and not SOUND_MUTED and 'pause_music' in SOUNDS and SOUNDS['pause_music']:
                                SOUNDS['pause_music'].stop()
                            pygame.mixer.music.unpause()
                        except Exception: pass
                else:
                    # Cheat codes: Shift + Number to jump to level
                    mods = pygame.key.get_mods()
                    if mods & pygame.KMOD_SHIFT:
                        if pygame.K_0 <= event.key <= pygame.K_9:
                            level = event.key - pygame.K_0
                            if level == 0: level = 10
                            lives = 3
                            multiballs_dropped = 0
                            rockets_dropped = 0
                            builders_dropped = 0
                            bricks = build_bricks(level)
                            paddle.width = 100
                            paddle.rect.width = 100
                            paddle.rockets_held = 0
                            balls = [Ball()]
                            balls[0].reset(paddle)
                            multiball_timer = 0
                            paddle_timer = 0
                            shoot_blink_timer = 0
                            screen_effect.active = None
                            particles.clear()
                            floating_texts.clear()
                            powerups.clear()
                            active_rockets.clear()
                            if level == 10:
                                state = "MAOMI_INTRO"
                                maomi_timer = 9.0
                                screen_effect.trigger('thunderstorm', heavy=True)
                                try:
                                    pygame.mixer.music.stop()
                                    pygame.mixer.music.load('src/soundtracks/evil_laugh.mp3')
                                    pygame.mixer.music.set_volume(0.8)
                                    pygame.mixer.music.play(0)
                                except: pass
                            else:
                                state = "PLAYING"
                            # Stop pause music if we warped while paused
                            try:
                                if MIXER_AVAILABLE and not SOUND_MUTED and 'pause_music' in SOUNDS and SOUNDS['pause_music']:
                                    SOUNDS['pause_music'].stop()
                                pygame.mixer.music.unpause()
                                if not pygame.mixer.music.get_busy():
                                    pygame.mixer.music.play(-1)
                            except Exception: pass
                            continue
                            
                    if state == "PLAYING":
                        if balls and not balls[0].launched:
                            balls[0].launch()
                        elif getattr(paddle, 'rockets_held', 0) > 0:
                            paddle.rockets_held -= 1
                            active_rockets.append(RocketProjectile(paddle.rect.centerx, paddle.rect.top - 12))
                            play_sound('explosion')
                            shake.trigger(8, 12)
                        
        # --- State Logic Updates ---
        
        if state == "PLAYING":
            starfield.update(dt)
            grid.update(dt)
            shake.update(dt)
            screen_effect.update(dt)
            
            paddle.update()
            
            # Update multiball timer
            if multiball_timer > 0:
                multiball_timer -= dt
                if multiball_timer <= 0:
                    multiball_timer = 0
                    if len(balls) > 1:
                        # Keep one living ball; prefer the first
                        balls = balls[:1]
                        
            # Update paddle timer
            if paddle_timer > 0:
                paddle_timer -= dt
                if paddle_timer <= 0:
                    paddle_timer = 0
                    paddle.width = 100
                    paddle.rect.width = 100
                    
            if shoot_blink_timer > 0:
                shoot_blink_timer -= dt

            # Update all balls, remove dead ones
            can_spawn_multiball = (multiballs_dropped < 2)
            can_spawn_rocket = (rockets_dropped < 2 and level > 1)
            can_spawn_builder = (builders_dropped < 5)
            for b in list(balls):
                b_alive, spawned_mb, spawned_rk, spawned_bdr = b.update(dt, paddle, bricks, particles, floating_texts, shake, powerups, can_spawn_multiball, can_spawn_rocket, can_spawn_builder)
                if spawned_mb:
                    multiballs_dropped += 1
                if spawned_rk:
                    rockets_dropped += 1
                if spawned_bdr:
                    builders_dropped += 1
                if not b_alive:
                    balls.remove(b)

            if len(balls) == 0:
                lives -= 1
                total_deaths += 1
                shake.trigger(15, 20)
                paddle.width = 100
                paddle.rect.width = 100
                play_sound('death')
                multiball_timer = 0
                if lives <= 0:
                    if level >= 10:
                        state = "RECORD_ENTRY"
                        player_name = ""
                    else:
                        state = "GAME_OVER"
                        try:
                            pygame.mixer.music.stop()
                            pygame.mixer.music.load('src/soundtracks/mario_gameover.mp3')
                            pygame.mixer.music.set_volume(0.6)
                            pygame.mixer.music.play(0)
                        except (pygame.error, FileNotFoundError, NotImplementedError, AttributeError):
                            pass
                else:
                    new_b = Ball()
                    new_b.reset(paddle)
                    balls = [new_b]
                    
            if len(bricks) == 0:
                if level >= 10:
                    state = "RECORD_ENTRY"
                    player_name = ""
                    play_sound('victory')
                else:
                    level += 1
                    lives = 3
                    multiballs_dropped = 0
                    rockets_dropped = 0
                    builders_dropped = 0
                    if level == 10:
                        state = "MAOMI_INTRO"
                        maomi_timer = 9.0
                        screen_effect.trigger('thunderstorm', heavy=True)
                        try:
                            pygame.mixer.music.stop()
                            pygame.mixer.music.load('src/soundtracks/evil_laugh.mp3')
                            pygame.mixer.music.set_volume(0.8)
                            pygame.mixer.music.play(0)
                        except: pass
                    else:
                        state = "LEVEL_TRANSITION"
                        transition_timer = 5.0
                    play_sound('victory')
                    balls = [Ball()]
                balls[0].reset(paddle)
                paddle.width = 100
                paddle.rect.width = 100
                paddle.rockets_held = 0
                paddle_timer = 0
                shoot_blink_timer = 0
                screen_effect.active = None
                particles.clear()
                floating_texts.clear()
                powerups.clear()
                active_rockets.clear()
                
            # Update falling power-ups
            for powerup in list(powerups):
                powerup.update(dt)
                
                # Check collision with paddle
                powerup_rect = pygame.Rect(powerup.x - powerup.radius, powerup.y - powerup.radius, powerup.radius * 2, powerup.radius * 2)
                if powerup_rect.colliderect(paddle.rect):
                    if powerup.type == "fire":
                        paddle.width = 60
                        floating_texts.append(FloatingText(paddle.rect.centerx, paddle.rect.top - 20, "SHRINK PADDLE!", (251, 146, 60), size_scale=2))
                        shake.trigger(10, 15)
                        play_sound('shrink')
                        screen_effect.trigger('thunderstorm')
                        if level > 3:
                            paddle_timer = 7.0 * 60
                    elif powerup.type == "superman":
                        paddle.width = 160
                        floating_texts.append(FloatingText(paddle.rect.centerx, paddle.rect.top - 20, "SUPER PADDLE!", (253, 224, 71), size_scale=2))
                        shake.trigger(10, 15)
                        play_sound('grow')
                        play_sound('fanfare')
                        screen_effect.trigger('rainbow')
                        if level > 3:
                            paddle_timer = 7.0 * 60
                    elif powerup.type == "multiball" and balls:
                        # Spawn 7 extra balls from current ball's position
                        ref = balls[0]
                        for _ in range(7):
                            nb = Ball()
                            nb.x = ref.x
                            nb.y = ref.y
                            angle = math.radians(random.uniform(-65, 65))
                            spd = ref.speed
                            nb.vx = spd * math.sin(angle)
                            nb.vy = -spd * abs(math.cos(angle))
                            nb.speed = spd
                            nb.launched = True
                            balls.append(nb)
                        multiball_timer = 300   # 5 seconds at 60 fps
                        floating_texts.append(FloatingText(paddle.rect.centerx, paddle.rect.top - 20, "8 BALLS!", (0, 230, 120), size_scale=3))
                        shake.trigger(18, 25)
                        play_sound('explosion')
                        screen_effect.trigger('explosion')
                    elif powerup.type == "rocket":
                        if getattr(paddle, 'rockets_held', 0) == 0:
                            shoot_blink_timer = 12.0
                        paddle.rockets_held = getattr(paddle, 'rockets_held', 0) + 1
                        floating_texts.append(FloatingText(paddle.rect.centerx, paddle.rect.top - 20, "ROCKET READY!", (255, 50, 50), size_scale=2))
                        play_sound('spawn')
                    elif powerup.type == "builder":
                        if level < 3:
                            cols = 10
                            rows = 7
                            brick_w = 68
                            gap_x = 4
                        else:
                            words = {3: "THREE", 4: "FOURTH", 5: "FIFTH", 6: "SIXTH", 7: "SEVENTH", 8: "EIGHTH", 9: "NINTH"}
                            word = words.get(level, "SURVIVE")
                            cols = len(word) * 3 + (len(word) - 1)
                            rows = 5
                            gap_x = 2
                            brick_w = max(10, (700 - (cols - 1) * gap_x) // cols)
                            
                        brick_h = 22
                        gap_y = 4
                        total_w = cols * brick_w + (cols - 1) * gap_x
                        start_x = (WIDTH - total_w) // 2
                        start_y = 90
                        
                        empty_spots = []
                        for r in range(rows):
                            for c in range(cols):
                                bx = start_x + c * (brick_w + gap_x)
                                by = start_y + r * (brick_h + gap_y)
                                temp_rect = pygame.Rect(bx, by, brick_w, brick_h)
                                if not any(br.rect.colliderect(temp_rect) for br in bricks):
                                    empty_spots.append((bx, by, r))
                        
                        if empty_spots:
                            num_spawn = max(5, 5 + (level - 3) * 2)
                            num_spawn = min(num_spawn, len(empty_spots))
                            chosen = random.sample(empty_spots, num_spawn)
                            for bx, by, r in chosen:
                                color = BRICK_COLORS[r % len(BRICK_COLORS)]
                                points = BRICK_POINTS[r % len(BRICK_POINTS)]
                                bricks.append(Brick(bx, by, brick_w, brick_h, color, points))
                                for _ in range(8):
                                    particles.append(Particle(bx + brick_w//2, by + brick_h//2, (200, 255, 200)))
                        
                        floating_texts.append(FloatingText(paddle.rect.centerx, paddle.rect.top - 20, "BRICKS BUILT!", (150, 150, 255), size_scale=2))
                        play_sound('spawn')
                    
                    paddle.update()
                    powerups.remove(powerup)
                elif powerup.y - powerup.radius > HEIGHT:
                    powerups.remove(powerup)
                    
            for p in list(particles):
                p.update(dt)
                if p.alpha <= 0:
                    particles.remove(p)
                    
            for rock in list(active_rockets):
                rock.update(dt)
                if random.random() < 0.5:
                    particles.append(Particle(rock.x, rock.y + rock.height//2, (255, 150, 0)))
                rock_rect = pygame.Rect(int(rock.x - rock.width//2), int(rock.y - rock.height//2), rock.width, rock.height)
                for br in list(bricks):
                    if rock_rect.colliderect(br.rect):
                        bricks.remove(br)
                        for _ in range(8):
                            particles.append(Particle(br.rect.centerx, br.rect.centery, (255, 100, 30)))
                        score += br.points
                        play_sound('explosion')
                        shake.trigger(5, 8)
                if rock.y < -50:
                    active_rockets.remove(rock)
                    
            for f in list(floating_texts):
                f.update(dt)
                if f.alpha <= 0:
                    floating_texts.remove(f)
                    
            score = 5000 - sum(b.points for b in bricks)
            
        elif state == "PAUSED":
            starfield.update(dt * 0.2)
            shake.update(dt)

        elif state == "LEVEL_TRANSITION":
            starfield.update(dt * 0.4)
            grid.update(dt * 0.4)
            shake.update(dt)
            transition_timer -= dt / 60.0
            if transition_timer <= 0:
                multiballs_dropped = 0
                rockets_dropped = 0
                bricks = build_bricks(level)
                state = "PLAYING"
                
        elif state == "MAOMI_INTRO":
            maomi_timer -= dt / 60.0
            screen_effect.update(dt)
            if maomi_timer <= 0:
                multiballs_dropped = 0
                rockets_dropped = 0
                bricks = build_bricks(level)
                state = "PLAYING"
                screen_effect.active = None
                
        elif state == "RECORD_ENTRY":
            starfield.update(dt * 0.4)
            grid.update(dt * 0.4)
            shake.update(dt)
            
        elif state in ["START", "GAME_OVER", "VICTORY", "LEADERBOARD"]:
            starfield.update(dt * 0.4)
            grid.update(dt * 0.4)
            shake.update(dt)
            for p in list(particles):
                p.update(dt)
                if p.alpha <= 0:
                    particles.remove(p)
                    
        # --- Draw Canvas ---
        canvas.fill(COLOR_BG)
        
        # Render celestial space grid background
        starfield.draw(canvas)
        grid.draw(canvas)
        
        if state in ["PLAYING", "PAUSED"]:
            # Render blocks, paddle, and ball
            for brick in bricks:
                brick.draw(canvas)
            paddle.draw(canvas)
            for b in balls:
                b.draw(canvas)
            for rock in active_rockets:
                rock.draw(canvas)
            
            # Power-ups
            for powerup in powerups:
                powerup.draw(canvas)
                
            # Particle effects
            for p in particles:
                p.draw(canvas)
            for f in floating_texts:
                f.draw(canvas)

            # Full-screen atmospheric effect (thunderstorm / rainbow)
            screen_effect.draw(canvas)

            # Score HUD
            speed_mult = balls[0].speed / 6.0 if balls and balls[0].launched else 1.0
            draw_hud(canvas, score, lives, speed_mult, level)
            
            if state == "PLAYING" and shoot_blink_timer > 0:
                draw_centered_string(canvas, "SHOOT", WIDTH // 2, HEIGHT // 2 - 20, 6, (255, 50, 50))
            
            if state == "PAUSED":
                # Darken background layer
                overlay = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
                overlay.fill((0, 0, 0, 160))
                canvas.blit(overlay, (0, 0))
                
                # Draw neon panel borders
                box_w, box_h = 360, 140
                box_rect = pygame.Rect((WIDTH - box_w) // 2, (HEIGHT - box_h) // 2, box_w, box_h)
                pygame.draw.rect(canvas, COLOR_BG, box_rect, border_radius=8)
                pygame.draw.rect(canvas, COLOR_PADDLE, box_rect, width=3, border_radius=8)
                
                draw_centered_glow_string(canvas, "PAUSED", WIDTH // 2, HEIGHT // 2 - 40, 4, COLOR_PADDLE, COLOR_GLOW)
                draw_centered_string(canvas, "PRESS P OR ESC TO RESUME", WIDTH // 2, HEIGHT // 2 + 15, 2, COLOR_TEXT)
                
        elif state == "START":
            # Glow titles
            draw_centered_glow_string(canvas, "NEON BREAKER", WIDTH // 2, HEIGHT // 2 - 130, 8, COLOR_PADDLE, COLOR_GLOW)
            draw_centered_string(canvas, "RETRO SYNTHWAVE ARCADE", WIDTH // 2, HEIGHT // 2 - 60, 2, COLOR_HORIZON)
            
            # Pulse click indicator
            draw_centered_glow_string(canvas, "CLICK TO PLAY", WIDTH // 2, HEIGHT // 2 + 30, 4, COLOR_TEXT, COLOR_GLOW, frequency=6)
            
            # Instruction display card
            instr_y = HEIGHT // 2 + 120
            draw_centered_string(canvas, "STEER PADDLE WITH MOUSE", WIDTH // 2, instr_y, 2, COLOR_TEXT)
            draw_centered_string(canvas, "CLICK OR SPACE TO LAUNCH THE BALL", WIDTH // 2, instr_y + 20, 2, COLOR_TEXT)
            draw_centered_string(canvas, "EACH BROKEN BRICK SPEEDS BALL +5%", WIDTH // 2, instr_y + 40, 2, COLOR_TEXT)
            draw_centered_string(canvas, "CATCH POWER-UPS: F (SHRINK) / S (GROW)", WIDTH // 2, instr_y + 60, 2, COLOR_HORIZON)
            draw_centered_string(canvas, "ESC OR P KEY TO PAUSE THE ACTION", WIDTH // 2, instr_y + 80, 2, COLOR_TEXT)
            
        elif state == "GAME_OVER":
            draw_centered_glow_string(canvas, "GAME OVER", WIDTH // 2, HEIGHT // 2 - 100, 8, COLOR_HORIZON, COLOR_GLOW)
            
            score_str = f"FINAL SCORE: {score}"
            draw_centered_string(canvas, score_str, WIDTH // 2, HEIGHT // 2 - 20, 3, COLOR_TEXT)
            
            draw_centered_glow_string(canvas, "CLICK TO RESTART", WIDTH // 2, HEIGHT // 2 + 80, 4, COLOR_TEXT, COLOR_GLOW, frequency=6)
            
        elif state == "VICTORY":
            draw_centered_glow_string(canvas, "VICTORY", WIDTH // 2, HEIGHT // 2 - 100, 8, COLOR_PADDLE, COLOR_GLOW)
            
            score_str = f"VICTORY SCORE: {score}"
            draw_centered_string(canvas, score_str, WIDTH // 2, HEIGHT // 2 - 20, 3, COLOR_TEXT)
            
            draw_centered_glow_string(canvas, "CLICK TO PLAY AGAIN", WIDTH // 2, HEIGHT // 2 + 80, 4, COLOR_TEXT, COLOR_GLOW, frequency=6)
            
        elif state == "LEADERBOARD":
            draw_centered_glow_string(canvas, "LEADERBOARD", WIDTH // 2, 80, 6, COLOR_PADDLE, COLOR_GLOW)
            
            y = 170
            draw_string(canvas, "RANK  NAME             SCORE   DEATHS", WIDTH // 2 - 280, y, 2, COLOR_HORIZON)
            y += 40
            for i, (name, sc, dths) in enumerate(leaderboard_data):
                draw_string(canvas, f"{i+1:2d}.   {name:<15} {sc:05d}   {dths:2d}", WIDTH // 2 - 280, y, 2, COLOR_TEXT)
                y += 35
                
            draw_centered_glow_string(canvas, "CLICK TO RETURN TO MENU", WIDTH // 2, HEIGHT - 70, 3, COLOR_TEXT, COLOR_GLOW, frequency=6)
            
        elif state == "LEVEL_TRANSITION":
            draw_centered_glow_string(canvas, f"LEVEL {level}", WIDTH // 2, HEIGHT // 2 - 60, 8, COLOR_PADDLE, COLOR_GLOW)
            
            # Map time to text
            if transition_timer > 4.0:
                text = "3"
            elif transition_timer > 3.0:
                text = "2"
            elif transition_timer > 2.0:
                text = "1"
            elif transition_timer > 1.0:
                text = "READY"
            else:
                text = "GO"
                
            draw_centered_string(canvas, text, WIDTH // 2, HEIGHT // 2 + 30, 6, COLOR_TEXT)
            
        elif state == "MAOMI_INTRO":
            canvas.fill(COLOR_BG)
            
            # Draw zooming maomi image
            zoom = 1.0 + (9.0 - max(0, maomi_timer)) * 0.05
            
            # Blink effect during the last 3 seconds
            show_image = True
            if maomi_timer < 3.0:
                # Flash wildly (strobe)
                if int(maomi_timer * 12) % 2 == 0:
                    show_image = False

            if show_image and 'MAOMI_IMG' in globals():
                w, h = MAOMI_IMG.get_size()
                nw, nh = int(w * zoom), int(h * zoom)
                scaled_img = pygame.transform.smoothscale(MAOMI_IMG, (nw, nh))
                cx = WIDTH // 2 - nw // 2
                cy = HEIGHT // 2 - nh // 2
                canvas.blit(scaled_img, (cx, cy))
            
            # Draw thunderstorm and lightning OVER the image
            screen_effect.draw(canvas)
            
            # Dark overlay for text
            overlay = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
            overlay.fill((0, 0, 0, 100))
            canvas.blit(overlay, (0, 0))
            
            blink = False
            # Headlines appear at 9.0 and 5.0 
            if 8.7 < maomi_timer <= 9.0 or 4.7 < maomi_timer <= 5.0:
                if random.random() < 0.4:
                    flash = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
                    flash.fill((255, 255, 255, 180))
                    canvas.blit(flash, (0, 0))
                    if random.random() < 0.15:
                        play_sound('thunder')
                if random.random() < 0.5:
                    blink = True
            
            if maomi_timer > 5.0:
                if not blink:
                    alpha = min(255, max(0, int((maomi_timer - 5.0) / 0.5 * 255)))
                    txt_surf = pygame.Surface((WIDTH, 80), pygame.SRCALPHA)
                    draw_centered_string(txt_surf, "NO BUDDY BEATS THE MAOMI QUEEN", WIDTH // 2, 40, 4, (255, 255, 255))
                    txt_surf.set_alpha(alpha)
                    canvas.blit(txt_surf, (0, HEIGHT // 2 - 40))
            else:
                if not blink:
                    alpha = min(255, max(0, int((maomi_timer) / 0.5 * 255)))
                    txt_surf = pygame.Surface((WIDTH, 80), pygame.SRCALPHA)
                    draw_centered_string(txt_surf, "MAOMI WILL TAKE YOUR LIFE!", WIDTH // 2, 40, 5, (255, 50, 50))
                    txt_surf.set_alpha(alpha)
                    canvas.blit(txt_surf, (0, HEIGHT // 2 - 40))
                
        elif state == "RECORD_ENTRY":
            draw_centered_glow_string(canvas, "NEW RECORD!", WIDTH // 2, HEIGHT // 2 - 120, 6, COLOR_PADDLE, COLOR_GLOW)
            draw_centered_string(canvas, f"SCORE:{score}  DEATHS:{total_deaths}", WIDTH // 2, HEIGHT // 2 - 50, 2, COLOR_HORIZON)
            draw_centered_string(canvas, "ENTER NAME:", WIDTH // 2, HEIGHT // 2, 3, COLOR_TEXT)
            
            # Draw Text Box
            box_w = 300
            box_h = 50
            box_rect = pygame.Rect(WIDTH // 2 - box_w // 2, HEIGHT // 2 + 30, box_w, box_h)
            pygame.draw.rect(canvas, (20, 20, 40), box_rect, border_radius=4)
            pygame.draw.rect(canvas, (253, 224, 71), box_rect, width=3, border_radius=4)
            
            # Draw typed text with cursor
            display_text = player_name + ("_" if pygame.time.get_ticks() % 1000 < 500 else "")
            draw_centered_string(canvas, display_text, WIDTH // 2, HEIGHT // 2 + 45, 3, (255, 255, 255))
            
        # Draw with Screen Shake Offset
        offset_x, offset_y = shake.get_offset()
        screen.blit(canvas, (offset_x, offset_y))
        
        pygame.display.flip()
 
    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()
