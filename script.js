/**
 * Mega Diwali Dhamaka Spin & Win Wheel Game
 * High-performance, accessible, standalone JavaScript
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. DATA DEFINITIONS - 8 WHEEL SLICES
  // ==========================================================================
  const PRIZES = [
    {
      id: 0,
      name: 'iPhone 18 Pro Max',
      line1: 'iPhone 18',
      line2: 'Pro Max',
      badge: 'GRAND PRIZE #1',
      subtitle: '1TB Titanium Edition',
      icon: '📱',
      image: 'iphone-18-pro-max.240x240.png',
      cash: 0,
      colorGrad: ['#dc2626', '#7f1d1d'],
      textColor: '#ffffff',
      tagColor: '#fef08a',
      isGrand: true,
      description: 'Brand new sealed iPhone 18 Pro Max Titanium with 1-Year Apple Care'
    },
    {
      id: 1,
      name: '₹50,000 Cash',
      line1: '₹50,000',
      line2: 'Mega Cash',
      badge: 'GRAND PRIZE #2',
      subtitle: 'Instant Bank / UPI Transfer',
      icon: '💰',
      cash: 50000,
      colorGrad: ['#059669', '#064e3b'],
      textColor: '#ffffff',
      tagColor: '#a7f3d0',
      isGrand: true,
      description: '₹50,000 Mega Festive Jackpot credited directly via UPI or IMPS'
    },
    {
      id: 2,
      name: 'Better Luck Next Time',
      line1: 'Better Luck',
      line2: 'Next Time',
      badge: 'TRY AGAIN',
      subtitle: 'Free Spin Bonus!',
      icon: '🍀',
      cash: 0,
      colorGrad: ['#334155', '#0f172a'],
      textColor: '#f1f5f9',
      tagColor: '#94a3b8',
      isGrand: false,
      isTryAgain: true,
      description: 'Keep your spirits high! Claim bonus free spins and try again.'
    },
    {
      id: 3,
      name: '₹5 Instant Cash',
      line1: '₹5 Cash',
      line2: 'Instant Win',
      badge: 'POCKET PRIZE',
      subtitle: 'Instant Wallet Credit',
      icon: '🪙',
      cash: 5,
      colorGrad: ['#d97706', '#78350f'],
      textColor: '#ffffff',
      tagColor: '#fde68a',
      isGrand: false,
      description: '₹5 pocket money instantly added to your festive cash balance.'
    },
    {
      id: 4,
      name: 'AirPods Pro Max',
      line1: 'AirPods',
      line2: 'Pro Max',
      badge: 'AUDIO LUXURY',
      subtitle: 'Spatial Audio Wireless',
      icon: '🎧',
      cash: 0,
      colorGrad: ['#7c3aed', '#4c1d95'],
      textColor: '#ffffff',
      tagColor: '#ddd6fe',
      isGrand: false,
      description: 'Premium Apple AirPods Max wireless headphones with Active Noise Cancellation'
    },
    {
      id: 5,
      name: '₹500 Voucher',
      line1: '₹500 Off',
      line2: 'Voucher',
      badge: 'SHOPPING VOUCHER',
      subtitle: 'Diwali Shopping Special',
      icon: '🛍️',
      cash: 500,
      colorGrad: ['#0891b2', '#164e63'],
      textColor: '#ffffff',
      tagColor: '#bae6fd',
      isGrand: false,
      description: '₹500 shopping discount coupon valid across top retail & e-commerce brands'
    },
    {
      id: 6,
      name: '₹1,000 Gift Card',
      line1: '₹1,000',
      line2: 'Gift Card',
      badge: 'GIFT CARD',
      subtitle: 'Amazon / Flipkart Card',
      icon: '🎁',
      cash: 1000,
      colorGrad: ['#db2777', '#831843'],
      textColor: '#ffffff',
      tagColor: '#fbcfe8',
      isGrand: false,
      description: '₹1,000 gift balance redeemable immediately on Amazon or Flipkart'
    },
    {
      id: 7,
      name: '₹50 Cashback',
      line1: '₹50 Flat',
      line2: 'Cashback',
      badge: 'INSTANT CASHBACK',
      subtitle: 'Flat UPI Wallet Credit',
      icon: '⚡',
      cash: 50,
      colorGrad: ['#2563eb', '#1e3a8a'],
      textColor: '#ffffff',
      tagColor: '#bfdbfe',
      isGrand: false,
      description: '₹50 Instant Diwali cashback transferred directly to your Google Pay or Paytm'
    }
  ];

  const NUM_SLICES = PRIZES.length; // 8
  const SLICE_ANGLE = (2 * Math.PI) / NUM_SLICES; // 45 deg in radians
  const SLICE_DEG = 360 / NUM_SLICES; // 45 deg

  // ==========================================================================
  // 2. STATE MANAGEMENT & LOCAL STORAGE
  // ==========================================================================
  let state = {
    spinsLeft: 1,
    walletTotal: 0,
    winningsHistory: [],
    soundEnabled: true,
    isSpinning: false,
    currentRotation: 0, // In degrees
    spinDuration: 4.5,  // seconds
    lastPegIndex: -1
  };

  const STORAGE_KEY = 'DIWALI_SPIN_WIN_STATE_V2';

  function loadSavedState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        state.spinsLeft = typeof parsed.spinsLeft === 'number' ? parsed.spinsLeft : 1;
        state.walletTotal = typeof parsed.walletTotal === 'number' ? parsed.walletTotal : 0;
        state.winningsHistory = Array.isArray(parsed.winningsHistory) ? parsed.winningsHistory : [];
        state.soundEnabled = parsed.soundEnabled !== false;
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        spinsLeft: state.spinsLeft,
        walletTotal: state.walletTotal,
        winningsHistory: state.winningsHistory,
        soundEnabled: state.soundEnabled
      }));
    } catch (e) {
      console.warn('Could not write to localStorage', e);
    }
  }

  // ==========================================================================
  // 3. AUDIO SYNTHESIZER (Web Audio API - Zero External Files)
  // ==========================================================================
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTickSound() {
    if (!state.soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      // Pitch sweeps slightly for snappy ratchet click
      const now = audioCtx.currentTime;
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch (e) {
      // Audio error ignored safely
    }
  }

  function playWinFanfare(isGrand = false) {
    if (!state.soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    try {
      const now = audioCtx.currentTime;
      const notes = isGrand 
        ? [523.25, 659.25, 783.99, 1046.50, 1318.51] // C5, E5, G5, C6, E6
        : [523.25, 659.25, 783.99, 1046.50];        // C5, E5, G5, C6

      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.001, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.28, now + idx * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.55);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.6);
      });
    } catch (e) {}
  }

  function playCoinChime() {
    if (!state.soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    try {
      const now = audioCtx.currentTime;
      [987.77, 1318.51].forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.25, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.38);
      });
    } catch (e) {}
  }

  function playTryAgainSound() {
    if (!state.soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    try {
      const now = audioCtx.currentTime;
      [440, 392, 349.23].forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.14);

        gain.gain.setValueAtTime(0.18, now + idx * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.28);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now + idx * 0.14);
        osc.stop(now + idx * 0.14 + 0.3);
      });
    } catch (e) {}
  }

  // ==========================================================================
  // 4. CANVAS WHEEL RENDERING (High-DPI Retina Crisp)
  // ==========================================================================
  const canvas = document.getElementById('wheel-canvas');
  const ctx = canvas.getContext('2d');
  let dpr = window.devicePixelRatio || 1;

  // Preload iPhone PNG image for Wheel Canvas
  const iphoneImg = new Image();
  let iphoneImgLoaded = false;
  iphoneImg.onload = () => {
    iphoneImgLoaded = true;
    if (!state.isSpinning) {
      drawWheel(state.currentRotation);
    }
  };
  iphoneImg.src = 'iphone-18-pro-max.240x240.png';

  function resizeCanvas() {
    dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height) || 500;
    
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset
    ctx.scale(dpr, dpr);
    
    drawWheel(state.currentRotation);
  }

  /**
   * Draws the complete 8-slice wheel at a given rotation angle (in degrees).
   */
  function drawWheel(rotationDeg) {
    const rect = canvas.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height) || 500;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;

    ctx.clearRect(0, 0, size, size);

    ctx.save();
    ctx.translate(centerX, centerY);
    // Rotate canvas by rotationDeg (converted to radians)
    ctx.rotate((rotationDeg * Math.PI) / 180);

    // 1. Draw 8 Slices
    for (let i = 0; i < NUM_SLICES; i++) {
      const startAngle = i * SLICE_ANGLE;
      const endAngle = (i + 1) * SLICE_ANGLE;
      const prize = PRIZES[i];

      // Draw Slice Background
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      // Create Linear Gradient across the slice
      const midAngle = startAngle + SLICE_ANGLE / 2;
      const gradX = Math.cos(midAngle) * radius;
      const gradY = Math.sin(midAngle) * radius;
      const grad = ctx.createLinearGradient(0, 0, gradX, gradY);
      grad.addColorStop(0, prize.colorGrad[0]);
      grad.addColorStop(1, prize.colorGrad[1]);

      ctx.fillStyle = grad;
      ctx.fill();

      // Outer rim highlight curve for each slice
      ctx.beginPath();
      ctx.arc(0, 0, radius - 2, startAngle, endAngle);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Slice Border / Separator lines
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(startAngle) * radius, Math.sin(startAngle) * radius);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // 2. Draw Content inside slice (Icon/Image, Line 1, Line 2)
      ctx.save();
      ctx.rotate(midAngle);

      // Icon or Image placed near the outer edge
      const iconDist = radius * 0.81;

      if (prize.image && iphoneImgLoaded) {
        ctx.save();
        ctx.translate(iconDist, 0);
        ctx.rotate(Math.PI / 2);
        const imgSize = Math.round(size * 0.096);
        ctx.shadowColor = 'rgba(255, 215, 0, 0.75)';
        ctx.shadowBlur = 10;
        ctx.drawImage(iphoneImg, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
        ctx.restore();
      } else {
        ctx.font = `${Math.round(size * 0.068)}px "Outfit", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(prize.icon, iconDist, 0);
      }

      // Text block in the middle of the slice
      const textDist = radius * 0.52;
      const fontSize = Math.round(size * 0.033);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      // Line 1 (Main Title)
      ctx.fillStyle = prize.textColor;
      ctx.font = `bold ${fontSize}px "Outfit", sans-serif`;
      ctx.fillText(prize.line1, textDist, -fontSize * 0.65);

      // Line 2 (Subtitle/Suffix)
      ctx.fillStyle = prize.tagColor || '#fde68a';
      ctx.font = `600 ${Math.round(fontSize * 0.88)}px "Outfit", sans-serif`;
      ctx.fillText(prize.line2, textDist, fontSize * 0.75);

      ctx.restore();
    }

    // 3. Draw Outer Pegs / Rivets (8 metal studs between slices)
    for (let i = 0; i < NUM_SLICES; i++) {
      const pegAngle = i * SLICE_ANGLE;
      const px = Math.cos(pegAngle) * (radius - 12);
      const py = Math.sin(pegAngle) * (radius - 12);

      // Outer glow
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#b45309';
      ctx.fill();

      // Inner peg
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#fffdf0';
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Peg metallic shine
      ctx.beginPath();
      ctx.arc(px - 1.5, py - 1.5, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    // 4. Center Golden Ring Bevel
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.23, 0, Math.PI * 2);
    ctx.fillStyle = '#1c0630';
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.23 - 4, 0, Math.PI * 2);
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  // ==========================================================================
  // 5. LED RIM BULBS & TICKER
  // ==========================================================================
  const lightsContainer = document.getElementById('lights-container');
  const NUM_BULBS = 24;
  const bulbs = [];

  function setupLedBulbs() {
    lightsContainer.innerHTML = '';
    bulbs.length = 0;

    for (let i = 0; i < NUM_BULBS; i++) {
      const bulb = document.createElement('div');
      bulb.className = 'rim-bulb';
      if (i % 2 === 0) bulb.classList.add('on');
      
      const angle = (i / NUM_BULBS) * 2 * Math.PI - Math.PI / 2;
      // Position on the outer circle
      const rPercent = 48.5; // percentage of rim container
      const x = 50 + rPercent * Math.cos(angle);
      const y = 50 + rPercent * Math.sin(angle);

      bulb.style.left = `${x}%`;
      bulb.style.top = `${y}%`;

      lightsContainer.appendChild(bulb);
      bulbs.push(bulb);
    }
  }

  let ledChaseInterval = null;
  let ledPhase = 0;

  function startLedChaser(speedMs = 120) {
    stopLedChaser();
    ledChaseInterval = setInterval(() => {
      ledPhase = (ledPhase + 1) % NUM_BULBS;
      bulbs.forEach((b, idx) => {
        const isLit = (idx + ledPhase) % 3 === 0;
        b.classList.toggle('on', isLit);
        b.classList.toggle('alt', (idx + ledPhase) % 3 === 1);
      });
    }, speedMs);
  }

  function stopLedChaser() {
    if (ledChaseInterval) {
      clearInterval(ledChaseInterval);
      ledChaseInterval = null;
    }
    // Return to steady festive glow
    bulbs.forEach((b, idx) => {
      b.classList.toggle('on', idx % 2 === 0);
      b.classList.remove('alt');
    });
  }

  const tickerEl = document.getElementById('wheel-ticker');

  function triggerTickerBounce() {
    tickerEl.classList.add('tick');
    setTimeout(() => {
      tickerEl.classList.remove('tick');
    }, 60);
  }

  // ==========================================================================
  // 6. WHEEL PHYSICS & SPIN CONTROLLER
  // ==========================================================================
  /**
   * Mathematics of stopping angle:
   * Pointer is at 12 o'clock (270° in canvas coordinate system).
   * Slice i starts at i * 45° and ends at (i + 1) * 45°.
   * Center of Slice i is: (i + 0.5) * 45°.
   * When canvas is rotated clockwise by angle R:
   * Pointer touches angle: (270 - R) mod 360.
   * To have Slice targetIndex at pointer:
   * R mod 360 = (270 - (targetIndex + 0.5) * 45) mod 360.
   */
  function calculateTargetAngle(targetIndex) {
    const sliceCenterDeg = (targetIndex + 0.5) * SLICE_DEG;
    let targetRestDeg = (270 - sliceCenterDeg) % 360;
    if (targetRestDeg < 0) targetRestDeg += 360;

    // Small organic jitter within the slice (+/- 14 degrees)
    const jitter = (Math.random() - 0.5) * 26; // inside [-13, +13]
    const finalNormalized = (targetRestDeg + jitter + 360) % 360;

    // Ensure at least 6 full revolutions + distance to reach final angle
    const minFullSpins = 6 + Math.floor(Math.random() * 3); // 6 to 8 spins
    const currentNorm = state.currentRotation % 360;
    let delta = finalNormalized - currentNorm;
    if (delta < 0) delta += 360;

    const totalAngleToAdd = minFullSpins * 360 + delta;
    return state.currentRotation + totalAngleToAdd;
  }

  /**
   * Cubic Bezier Easing: Quartic Out (crisp deceleration feel)
   */
  function easeOutQuart(x) {
    return 1 - Math.pow(1 - x, 4);
  }

  function spinWheelTo(targetIndex) {
    if (state.isSpinning) return;
    if (state.spinsLeft <= 0) {
      showToast('⚠️ No spins left! Share on WhatsApp to get +3 free spins.', 'warning');
      return;
    }

    initAudio();
    state.isSpinning = true;
    updateControlsUI();

    // Deduct one spin
    state.spinsLeft--;
    saveState();
    updateStatsBar();

    const startAngle = state.currentRotation;
    const targetAngle = calculateTargetAngle(targetIndex);
    const durationMs = state.spinDuration * 1000;
    const startTime = performance.now();

    startLedChaser(70);
    state.lastPegIndex = -1;

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const easedProgress = easeOutQuart(progress);

      const currentAngle = startAngle + (targetAngle - startAngle) * easedProgress;
      state.currentRotation = currentAngle;
      drawWheel(currentAngle);

      // Track peg crossing for ticking sound and pointer bounce
      // Slices borders are every 45 degrees
      const pegPosition = Math.floor(((currentAngle % 360) + 360) % 360 / SLICE_DEG);
      if (pegPosition !== state.lastPegIndex) {
        state.lastPegIndex = pegPosition;
        playTickSound();
        triggerTickerBounce();
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Spin finished!
        state.isSpinning = false;
        stopLedChaser();
        updateControlsUI();
        onSpinComplete(targetIndex);
      }
    }

    requestAnimationFrame(animate);
  }

  /**
   * Determine winning prize based on weighted probability in normal gameplay:
   * Grand prizes (iPhone & ₹50K) are boosted for higher win rates!
   */
  function pickRandomPrizeIndex() {
    // Weights for 8 slices (total = 100)
    // 0: iPhone 18 Pro Max -> 35% (Boosted Grand Prize #1)
    // 1: ₹50,000 Cash      -> 35% (Boosted Grand Prize #2)
    // 2: Better Luck       -> 5%
    // 3: ₹5 Cash           -> 5%
    // 4: AirPods Pro Max   -> 6%
    // 5: ₹500 Voucher      -> 4%
    // 6: ₹1,000 Gift Card  -> 5%
    // 7: ₹50 Cashback      -> 5%
    const weights = [35, 35, 5, 5, 6, 4, 5, 5];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * totalWeight;

    for (let i = 0; i < weights.length; i++) {
      if (rand < weights[i]) return i;
      rand -= weights[i];
    }
    return 0; // Fallback to iPhone 18 Pro Max
  }

  // ==========================================================================
  // 7. WINNING OUTCOME & DIALOG MODAL
  // ==========================================================================
  const prizeDialog = document.getElementById('prize-dialog');
  const dialogCloseBtn = document.getElementById('dialog-close-btn');
  const modalSpinAgainBtn = document.getElementById('modal-spin-again-btn');
  const claimNowBtn = document.getElementById('claim-now-btn');
  const modalRevealView = document.getElementById('modal-reveal-view');
  const modalClaimCard = document.getElementById('modal-claim-card');
  const whatsappShareBtn = document.getElementById('whatsappShareBtn');
  const mainWhatsappShareBtn = document.getElementById('main-whatsapp-share-btn');
  let latestWonPrize = null;

  function shareViaWhatsApp(prize) {
    const pageUrl = window.location.href;
    let shareMsg = '🪔 Spin & Win Grand Prizes up to iPhone 18 Pro Max & ₹50,000 Cash! Check it out:';
    if (prize && !prize.isTryAgain) {
      shareMsg = `🪔 I just won ${prize.name} on the Diwali Spin & Win Wheel! Play here and try your luck:`;
    }
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMsg + ' ' + pageUrl)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }

  function onSpinComplete(prizeIndex) {
    const prize = PRIZES[prizeIndex];
    latestWonPrize = prize;

    // Record in state
    const record = {
      id: Date.now(),
      name: prize.name,
      badge: prize.badge,
      icon: prize.icon,
      cash: prize.cash,
      isGrand: prize.isGrand,
      isTryAgain: !!prize.isTryAgain,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    state.winningsHistory.unshift(record);
    if (prize.cash > 0) {
      state.walletTotal += prize.cash;
    }
    saveState();
    updateStatsBar();
    renderWinningsList();

    // Audio & Confetti
    if (prize.isTryAgain) {
      playTryAgainSound();
    } else if (prize.isGrand) {
      playWinFanfare(true);
      launchConfetti(4000, true);
    } else if (prize.cash > 0) {
      playCoinChime();
      playWinFanfare(false);
      launchConfetti(2500, false);
    } else {
      playWinFanfare(false);
      launchConfetti(2500, false);
    }

    // Populate and open dialog modal
    showPrizeModal(prize);
  }

  function showPrizeModal(prize) {
    latestWonPrize = prize;
    if (modalRevealView) modalRevealView.hidden = false;
    if (modalClaimCard) modalClaimCard.hidden = true;

    const titleEl = document.getElementById('dialog-title');
    const subtitleEl = document.getElementById('modal-subtitle');
    const tagEl = document.getElementById('modal-tag');
    const prizeNameEl = document.getElementById('won-prize-name');
    const prizeDescEl = document.getElementById('won-prize-desc');
    const prizeIconEl = document.getElementById('won-prize-icon');
    const modalIconEl = document.getElementById('modal-icon');

    if (prize.isTryAgain) {
      tagEl.textContent = 'BETTER LUCK';
      tagEl.style.background = '#64748b';
      titleEl.textContent = 'Keep Going!';
      subtitleEl.textContent = 'The grand prize is still waiting on the wheel.';
      modalIconEl.textContent = '🍀';
      prizeNameEl.textContent = prize.name;
      prizeDescEl.textContent = 'Share on WhatsApp below to get +3 free spins and keep spinning!';
      prizeIconEl.textContent = prize.icon;
      claimNowBtn.style.display = 'none';
    } else {
      tagEl.textContent = prize.badge;
      tagEl.style.background = prize.isGrand 
        ? 'linear-gradient(90deg, #f59e0b, #e11d48)' 
        : 'linear-gradient(90deg, #10b981, #0891b2)';
      titleEl.textContent = prize.isGrand ? '🎉 MEGA JACKPOT! 🎉' : 'Congratulations!';
      subtitleEl.textContent = prize.isGrand 
        ? 'Incredible! You have unlocked a Grand Prize!' 
        : 'You have won an official Diwali reward!';
      modalIconEl.textContent = prize.isGrand ? '👑' : '🎉';
      prizeNameEl.textContent = prize.name;
      prizeDescEl.textContent = prize.description;
      if (prize.image) {
        prizeIconEl.innerHTML = `<img src="${prize.image}" alt="${prize.name}" class="won-prize-img">`;
      } else {
        prizeIconEl.textContent = prize.icon;
      }
      claimNowBtn.style.display = 'flex';
    }

    // Open modern modal
    if (typeof prizeDialog.showModal === 'function') {
      prizeDialog.showModal();
    } else {
      prizeDialog.setAttribute('open', '');
    }
  }

  function closePrizeModal() {
    if (prizeDialog.open) {
      prizeDialog.close();
    }
    if (modalRevealView) modalRevealView.hidden = false;
    if (modalClaimCard) modalClaimCard.hidden = true;
  }

  // ==========================================================================
  // 8. HIGH-PERFORMANCE CONFETTI SYSTEM
  // ==========================================================================
  const confettiCanvas = document.getElementById('confetti-canvas');
  const cCtx = confettiCanvas.getContext('2d');
  let confettiParticles = [];
  let confettiAnimationId = null;

  function resizeConfetti() {
    confettiCanvas.width = window.innerWidth * dpr;
    confettiCanvas.height = window.innerHeight * dpr;
    cCtx.setTransform(1, 0, 0, 1, 0, 0);
    cCtx.scale(dpr, dpr);
  }

  function launchConfetti(durationMs = 3000, isMega = false) {
    resizeConfetti();
    const count = isMega ? 220 : 120;
    const colors = ['#ffd700', '#f59e0b', '#e11d48', '#10b981', '#06b6d4', '#a855f7', '#ffffff'];

    for (let i = 0; i < count; i++) {
      confettiParticles.push({
        x: window.innerWidth * 0.5 + (Math.random() - 0.5) * 200,
        y: window.innerHeight * 0.45,
        vx: (Math.random() - 0.5) * (isMega ? 24 : 16),
        vy: -Math.random() * (isMega ? 20 : 14) - 5,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        gravity: 0.35,
        drag: 0.985,
        alpha: 1,
        isStar: Math.random() > 0.6
      });
    }

    if (!confettiAnimationId) {
      const stopTime = performance.now() + durationMs;
      animateConfetti(stopTime);
    }
  }

  function animateConfetti(stopTime) {
    cCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = confettiParticles.length - 1; i >= 0; i--) {
      const p = confettiParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.rotation += p.rotSpeed;

      if (performance.now() > stopTime) {
        p.alpha -= 0.02;
      }

      if (p.alpha <= 0 || p.y > window.innerHeight + 50) {
        confettiParticles.splice(i, 1);
        continue;
      }

      cCtx.save();
      cCtx.translate(p.x, p.y);
      cCtx.rotate((p.rotation * Math.PI) / 180);
      cCtx.globalAlpha = Math.max(p.alpha, 0);
      cCtx.fillStyle = p.color;

      if (p.isStar) {
        cCtx.beginPath();
        cCtx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
        cCtx.fill();
      } else {
        cCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      cCtx.restore();
    }

    if (confettiParticles.length > 0) {
      confettiAnimationId = requestAnimationFrame(() => animateConfetti(stopTime));
    } else {
      cCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      confettiAnimationId = null;
    }
  }

  // ==========================================================================
  // 9. AMBIENT BACKGROUND PARTICLES (Diwali Sparks & Fireflies)
  // ==========================================================================
  const ambientCanvas = document.getElementById('ambient-canvas');
  const aCtx = ambientCanvas.getContext('2d');
  const ambientSparks = [];

  function initAmbientSparks() {
    ambientCanvas.width = window.innerWidth;
    ambientCanvas.height = window.innerHeight;
    ambientSparks.length = 0;
    const count = 35;

    for (let i = 0; i < count; i++) {
      ambientSparks.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.5 - 0.2,
        alpha: Math.random() * 0.7 + 0.3,
        pulseSpeed: Math.random() * 0.02 + 0.01
      });
    }
  }

  function drawAmbientSparks() {
    aCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = 0; i < ambientSparks.length; i++) {
      const s = ambientSparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.alpha += Math.sin(performance.now() * 0.002 + i) * 0.01;

      if (s.y < -10) s.y = window.innerHeight + 10;
      if (s.x < -10) s.x = window.innerWidth + 10;
      if (s.x > window.innerWidth + 10) s.x = -10;

      aCtx.beginPath();
      aCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      aCtx.fillStyle = `rgba(255, 215, 0, ${Math.min(Math.max(s.alpha, 0.1), 0.85)})`;
      aCtx.shadowColor = '#ffd700';
      aCtx.shadowBlur = 8;
      aCtx.fill();
    }

    requestAnimationFrame(drawAmbientSparks);
  }

  // ==========================================================================
  // 10. UI UPDATERS & HELPERS
  // ==========================================================================
  const spinsCountEl = document.getElementById('spins-count');
  const walletTotalEl = document.getElementById('wallet-total');
  const spinBtn = document.getElementById('spin-btn');
  const bigSpinBtn = document.getElementById('big-spin-btn');
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const soundIconEl = document.getElementById('sound-icon');
  const statusMsgEl = document.getElementById('status-message');
  const prizesGridEl = document.getElementById('prizes-grid');
  const winningsListEl = document.getElementById('winnings-list');
  const clearHistoryBtn = document.getElementById('clear-history-btn');
  const toastContainer = document.getElementById('toast-container');

  function updateStatsBar() {
    if (spinsCountEl) spinsCountEl.textContent = state.spinsLeft;
    if (walletTotalEl) walletTotalEl.textContent = `₹${state.walletTotal.toLocaleString('en-IN')}`;
    if (soundIconEl) soundIconEl.textContent = state.soundEnabled ? '🔊' : '🔇';
    if (soundToggleBtn) soundToggleBtn.setAttribute('title', state.soundEnabled ? 'Sound is ON' : 'Sound is MUTED');
  }

  function updateControlsUI() {
    const disabled = state.isSpinning || state.spinsLeft <= 0;
    if (spinBtn) spinBtn.disabled = disabled;
    if (bigSpinBtn) bigSpinBtn.disabled = disabled;

    if (!statusMsgEl) return;
    if (state.isSpinning) {
      statusMsgEl.innerHTML = '✨ <strong>Spinning...</strong> Holding your breath for the jackpot!';
    } else if (state.spinsLeft <= 0) {
      statusMsgEl.innerHTML = '⚠️ <strong>Out of spins!</strong> Share on WhatsApp to get +3 free spins.';
    } else {
      const chanceWord = state.spinsLeft === 1 ? 'chance' : 'chances';
      statusMsgEl.innerHTML = `✨ You have <strong>${state.spinsLeft} ${chanceWord}</strong> remaining. Best of luck!`;
    }
  }

  function renderPrizesShowcase() {
    if (!prizesGridEl) return;
    prizesGridEl.innerHTML = '';
    PRIZES.forEach((p) => {
      const item = document.createElement('div');
      item.className = 'prize-showcase-item';
      if (p.isGrand) item.classList.add('highlight-grand');

      item.innerHTML = `
        <span class="item-icon" aria-hidden="true">${p.icon}</span>
        <div class="item-info">
          <span class="item-badge">${p.badge}</span>
          <span class="item-name" title="${p.name}">${p.name}</span>
          <span class="item-val">${p.subtitle}</span>
        </div>
      `;
      prizesGridEl.appendChild(item);
    });
  }

  function renderWinningsList() {
    if (!winningsListEl) return;
    if (state.winningsHistory.length === 0) {
      winningsListEl.innerHTML = `
        <div class="empty-winnings">
          <span class="empty-icon">🎡</span>
          <p>No spins yet! Spin the wheel to start collecting prizes.</p>
        </div>
      `;
      return;
    }

    winningsListEl.innerHTML = '';
    state.winningsHistory.forEach((item) => {
      const rec = document.createElement('div');
      rec.className = 'win-record';
      if (item.isGrand) rec.classList.add('record-grand');
      if (item.isTryAgain) rec.classList.add('record-tryagain');

      rec.innerHTML = `
        <div class="win-record-left">
          <span class="record-icon">${item.icon}</span>
          <div>
            <div class="win-record-name">${item.name}</div>
            <div class="win-record-time">${item.time}</div>
          </div>
        </div>
        <span class="card-badge">${item.badge}</span>
      `;
      winningsListEl.appendChild(rec);
    });
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    const icon = type === 'warning' ? '⚠️' : type === 'success' ? '🎉' : '✨';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // ==========================================================================
  // 12. EVENT LISTENERS
  // ==========================================================================
  function setupEventListeners() {
    // Spin trigger buttons
    const triggerSpin = () => {
      if (state.isSpinning) return;
      const targetIdx = pickRandomPrizeIndex();
      spinWheelTo(targetIdx);
    };

    spinBtn.addEventListener('click', triggerSpin);
    bigSpinBtn.addEventListener('click', triggerSpin);

    // Grant bonus free spins helper
    function grantFreeSpins(count = 3) {
      state.spinsLeft += count;
      saveState();
      updateStatsBar();
      updateControlsUI();
      playCoinChime();
      showToast(`🎁 Festive Bonus! +${count} Free Spins added!`, 'success');
    }

    // Sound toggle
    if (soundToggleBtn) {
      soundToggleBtn.addEventListener('click', () => {
        state.soundEnabled = !state.soundEnabled;
        saveState();
        updateStatsBar();
        if (state.soundEnabled) {
          initAudio();
          playTickSound();
          showToast('🔊 Sound enabled', 'info');
        } else {
          showToast('🔇 Sound muted', 'info');
        }
      });
    }

    // Modal buttons
    dialogCloseBtn.addEventListener('click', closePrizeModal);
    modalSpinAgainBtn.addEventListener('click', () => {
      closePrizeModal();
      if (state.spinsLeft > 0) {
        setTimeout(triggerSpin, 350);
      }
    });

    claimNowBtn.addEventListener('click', () => {
      if (modalRevealView) modalRevealView.hidden = true;
      if (modalClaimCard) modalClaimCard.hidden = false;
      playCoinChime();
      launchConfetti(2500, false);
    });

    // Share on WhatsApp triggers 3 free spins & opens WhatsApp
    if (whatsappShareBtn) {
      whatsappShareBtn.addEventListener('click', (e) => {
        e.preventDefault();
        grantFreeSpins(3);
        shareViaWhatsApp(latestWonPrize);
      });
    }

    if (mainWhatsappShareBtn) {
      mainWhatsappShareBtn.addEventListener('click', (e) => {
        e.preventDefault();
        grantFreeSpins(3);
        shareViaWhatsApp(latestWonPrize);
      });
    }

    // Clear history button
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Clear your win records? (Wallet cash will be preserved)')) {
          state.winningsHistory = [];
          saveState();
          renderWinningsList();
          showToast('History cleared', 'info');
        }
      });
    }

    // Mobile Navigation Drawer Toggle
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const mobileDrawer = document.getElementById('mobile-nav-drawer');
    if (mobileToggle && mobileDrawer) {
      mobileToggle.addEventListener('click', () => {
        const isOpen = mobileDrawer.classList.toggle('open');
        mobileToggle.setAttribute('aria-expanded', isOpen);
        mobileToggle.textContent = isOpen ? '✕' : '☰';
      });

      mobileDrawer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          mobileDrawer.classList.remove('open');
          mobileToggle.setAttribute('aria-expanded', 'false');
          mobileToggle.textContent = '☰';
        });
      });
    }

    // New Year Upcoming Games Pre-Registration
    const notifyBtns = document.querySelectorAll('.upcoming-notify-btn');
    notifyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const gameName = btn.getAttribute('data-game') || 'Upcoming Game';
        btn.disabled = true;
        btn.innerHTML = '<span>✅ Pre-Registered! (VIP Added)</span>';
        btn.style.background = '#10b981';
        btn.style.borderColor = '#34d399';
        btn.style.color = '#ffffff';
        playCoinChime();
        launchConfetti(2200, false);
        showToast(`🎉 You are pre-registered for ${gameName}! Bonus spins reserved.`, 'success');
      });
    });

    // Contact Form Submission (if present on page)
    const contactForm = document.getElementById('site-contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Sending Message...';
        }
        setTimeout(() => {
          contactForm.reset();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Message';
          }
          playCoinChime();
          showToast('✅ Message sent successfully! Our support desk will reply within 24 hours.', 'success');
          const respMsg = document.getElementById('contact-form-response');
          if (respMsg) {
            respMsg.hidden = false;
            respMsg.scrollIntoView({ behavior: 'smooth' });
          }
        }, 800);
      });
    }

    // Light dismiss for dialog (Modern Web Guidance fallback)
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const outside = (e, dialog) => {
        const r = dialog.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      let pressedOutside = false;
      prizeDialog.addEventListener('pointerdown', (e) => {
        pressedOutside = outside(e, prizeDialog);
      });
      prizeDialog.addEventListener('pointerup', (e) => {
        if (pressedOutside && outside(e, prizeDialog)) {
          closePrizeModal();
        }
      });
    }

    // Window Resize Handling
    window.addEventListener('resize', () => {
      resizeCanvas();
      resizeConfetti();
      initAmbientSparks();
    });
  }

  // ==========================================================================
  // 14. AMAZON-STYLE REVIEWS SYSTEM (Temporary Browser Storage & Pagination)
  // ==========================================================================
  const TEMP_REVIEWS_KEY = 'TEMP_BROWSER_REVIEWS_SESSION_V1';

  function initReviewsSystem() {
    const openWriteBtn = document.getElementById('open-write-review-btn');
    const writeContainer = document.getElementById('write-review-container');
    const closeFormBtn = document.getElementById('close-review-form-btn');
    const cancelFormBtn = document.getElementById('cancel-review-btn');
    const addReviewForm = document.getElementById('add-review-form');
    const starPicker = document.getElementById('star-picker');
    const ratingInput = document.getElementById('review-rating-val');
    const photoInput = document.getElementById('review-photo-input');
    const photoPreviewWrap = document.getElementById('review-photo-preview');
    const previewImg = document.getElementById('preview-img');
    const removePreviewBtn = document.getElementById('remove-preview-btn');
    const reviewsFeedList = document.getElementById('reviews-feed-list');
    const viewAllBtn = document.getElementById('view-all-reviews-btn');
    const viewAllText = document.getElementById('view-all-text');
    const showingCountEl = document.getElementById('reviews-showing-count');

    let currentPhotoDataUrl = null;
    let reviewsExpanded = false;

    // 1. Toggle Write Review Form
    if (openWriteBtn && writeContainer) {
      openWriteBtn.addEventListener('click', () => {
        writeContainer.hidden = !writeContainer.hidden;
        if (!writeContainer.hidden) {
          writeContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          const nameInput = document.getElementById('review-user-name');
          if (nameInput) nameInput.focus();
        }
      });
    }

    const closeForm = () => {
      if (writeContainer) writeContainer.hidden = true;
      if (addReviewForm) addReviewForm.reset();
      currentPhotoDataUrl = null;
      if (photoPreviewWrap) photoPreviewWrap.hidden = true;
      if (ratingInput) ratingInput.value = '5';
      updateStarDisplay(5);
    };

    if (closeFormBtn) closeFormBtn.addEventListener('click', closeForm);
    if (cancelFormBtn) cancelFormBtn.addEventListener('click', closeForm);

    // 2. Interactive Star Rating Picker
    function updateStarDisplay(val) {
      if (!starPicker) return;
      const stars = starPicker.querySelectorAll('.star-pick-btn');
      stars.forEach(s => {
        const sVal = parseInt(s.dataset.val, 10);
        s.classList.toggle('selected', sVal <= val);
      });
    }

    if (starPicker && ratingInput) {
      starPicker.addEventListener('click', (e) => {
        const btn = e.target.closest('.star-pick-btn');
        if (!btn) return;
        const val = parseInt(btn.dataset.val, 10);
        ratingInput.value = val;
        updateStarDisplay(val);
      });
    }

    // 3. Photo Upload Preview
    if (photoInput) {
      photoInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          // File size limit (max 3MB for local temporary storage)
          if (file.size > 3 * 1024 * 1024) {
            showToast('⚠️ Image too large. Please select a photo under 3MB.', 'warning');
            photoInput.value = '';
            return;
          }
          const reader = new FileReader();
          reader.onload = (loadEvt) => {
            currentPhotoDataUrl = loadEvt.target.result;
            if (previewImg) previewImg.src = currentPhotoDataUrl;
            if (photoPreviewWrap) photoPreviewWrap.hidden = false;
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (removePreviewBtn) {
      removePreviewBtn.addEventListener('click', () => {
        currentPhotoDataUrl = null;
        if (photoInput) photoInput.value = '';
        if (photoPreviewWrap) photoPreviewWrap.hidden = true;
        if (previewImg) previewImg.src = '';
      });
    }

    // 4. Temporary Review Submission (sessionStorage only - zero DB)
    function getTempReviews() {
      try {
        const saved = sessionStorage.getItem(TEMP_REVIEWS_KEY);
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        return [];
      }
    }

    function saveTempReviews(list) {
      try {
        sessionStorage.setItem(TEMP_REVIEWS_KEY, JSON.stringify(list));
      } catch (e) {
        console.warn('Session storage quota exceeded', e);
      }
    }

    function createReviewElement(rev) {
      const art = document.createElement('article');
      art.className = 'amazon-review-item temporary-user-review';
      const starsStr = '★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating);

      let imageHtml = '';
      if (rev.photo) {
        imageHtml = `
          <div class="review-customer-images">
            <img src="${rev.photo}" alt="User uploaded review photo" class="review-thumbnail-img" width="160" height="160" loading="lazy">
          </div>
        `;
      }

      art.innerHTML = `
        <div class="amazon-user-row">
          <div class="amazon-avatar-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="#ffa41c">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
          <span class="amazon-user-name">${escapeHTML(rev.name)}</span>
        </div>
        <div class="amazon-rating-row">
          <span class="amazon-stars" aria-label="${rev.rating}.0 out of 5 stars">${starsStr}</span>
          <h4 class="amazon-review-headline">${escapeHTML(rev.headline)}</h4>
        </div>
        <div class="amazon-meta-row">
          <span class="review-date">Reviewed in India on ${rev.date}</span>
          <span class="review-variant">Prize: Festive Winner</span>
          <span class="amazon-verified-badge">Verified Winner</span>
        </div>
        <p class="amazon-review-body">${escapeHTML(rev.body)}</p>
        ${imageHtml}
        <div class="amazon-review-footer">
          <span class="helpful-count">1 person found this helpful</span>
          <div class="helpful-action-group">
            <button type="button" class="amazon-helpful-btn">Helpful</button>
            <span class="amazon-pipe">|</span>
            <button type="button" class="amazon-report-btn">Report</button>
          </div>
        </div>
      `;
      return art;
    }

    function escapeHTML(str) {
      const div = document.createElement('div');
      div.textContent = str || '';
      return div.innerHTML;
    }

    if (addReviewForm) {
      addReviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameVal = document.getElementById('review-user-name').value.trim();
        const headVal = document.getElementById('review-headline').value.trim();
        const bodyVal = document.getElementById('review-body').value.trim();
        const ratingVal = parseInt(ratingInput ? ratingInput.value : '5', 10) || 5;

        if (!nameVal || !headVal || !bodyVal) {
          showToast('⚠️ Please fill out all required review fields.', 'warning');
          return;
        }

        const newReview = {
          id: Date.now(),
          name: nameVal,
          rating: ratingVal,
          headline: headVal,
          body: bodyVal,
          date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
          photo: currentPhotoDataUrl
        };

        const existing = getTempReviews();
        existing.unshift(newReview);
        saveTempReviews(existing);

        if (reviewsFeedList) {
          const el = createReviewElement(newReview);
          reviewsFeedList.prepend(el);
        }

        closeForm();
        updatePaginationDisplay();
        showToast('🎉 Review added temporarily to your browser session!', 'success');
      });
    }

    // 5. Restore Temp Reviews on Load
    function loadSavedTempReviews() {
      if (!reviewsFeedList) return;
      const saved = getTempReviews();
      // Render in reverse so order is preserved
      for (let i = saved.length - 1; i >= 0; i--) {
        const el = createReviewElement(saved[i]);
        reviewsFeedList.prepend(el);
      }
      updatePaginationDisplay();
    }

    // 6. View All Reviews Pagination Handler (Default: 5 reviews visible)
    function updatePaginationDisplay() {
      if (!reviewsFeedList) return;
      const allArticles = reviewsFeedList.querySelectorAll('.amazon-review-item');
      const totalReviews = allArticles.length;

      allArticles.forEach((art, idx) => {
        if (reviewsExpanded) {
          art.style.display = 'flex';
        } else {
          // Show only first 5 reviews by default
          art.style.display = idx < 5 ? 'flex' : 'none';
        }
      });

      if (viewAllBtn) {
        if (totalReviews <= 5) {
          viewAllBtn.style.display = 'none';
        } else {
          viewAllBtn.style.display = 'inline-flex';
          if (viewAllText) {
            viewAllText.textContent = reviewsExpanded 
              ? 'Show fewer reviews' 
              : `View all reviews (${totalReviews})`;
          }
          viewAllBtn.classList.toggle('expanded', reviewsExpanded);
        }
      }

      if (showingCountEl) {
        const visibleCount = reviewsExpanded ? totalReviews : Math.min(5, totalReviews);
        showingCountEl.textContent = `Showing ${visibleCount} of ${totalReviews} reviews`;
      }
    }

    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', () => {
        reviewsExpanded = !reviewsExpanded;
        updatePaginationDisplay();
        if (!reviewsExpanded && reviewsFeedList) {
          reviewsFeedList.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    // Run initial setup
    loadSavedTempReviews();
  }

  // ==========================================================================
  // 13. INITIALIZATION
  // ==========================================================================
  function init() {
    loadSavedState();
    setupLedBulbs();
    renderPrizesShowcase();
    renderWinningsList();
    updateStatsBar();
    updateControlsUI();
    setupEventListeners();
    initReviewsSystem();

    resizeCanvas();
    initAmbientSparks();
    drawAmbientSparks();
  }

  // Kickstart after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
