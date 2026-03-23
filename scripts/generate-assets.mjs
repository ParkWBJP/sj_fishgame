import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const rootDir = process.cwd();

function ensureDir(filePath) {
  mkdirSync(dirname(filePath), { recursive: true });
}

function writeText(filePath, contents) {
  ensureDir(filePath);
  writeFileSync(filePath, contents, "utf8");
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function fishGeometry(silhouette) {
  if (silhouette === "spiny") {
    return {
      bodyPath: "M84 132C88 88 132 48 194 50C246 52 290 78 316 116C308 162 270 192 214 196C146 200 94 176 84 132Z",
      bellyPath: "M118 146C138 170 176 182 218 176C246 172 274 160 292 142C264 174 226 192 180 194C144 194 122 176 118 146Z",
      tailPath: "M312 118C352 92 392 86 404 104C392 122 352 152 318 160C328 148 332 134 312 118Z",
      topFinPath: "M174 50C182 18 200 6 214 8C214 34 222 52 242 70C220 64 198 58 174 50Z",
      bottomFinPath: "M176 170C202 182 226 202 230 220C206 214 186 202 158 186C168 182 174 176 176 170Z",
      mouthPath: "M68 130C58 128 52 134 50 140",
      gillPath: "M136 110C146 124 146 144 136 158",
      eyeX: 110,
      eyeY: 112
    };
  }

  if (silhouette === "tall") {
    return {
      bodyPath: "M92 132C92 74 138 34 204 38C262 42 304 80 314 124C308 172 264 204 202 206C132 204 94 176 92 132Z",
      bellyPath: "M126 144C142 172 174 190 212 188C242 186 272 172 292 146C270 188 228 208 178 206C148 204 130 182 126 144Z",
      tailPath: "M306 120C350 98 390 96 402 112C390 128 350 164 316 170C324 156 326 136 306 120Z",
      topFinPath: "M170 42C180 10 204 0 220 6C216 34 230 56 252 80C226 68 196 56 170 42Z",
      bottomFinPath: "M160 178C182 194 198 214 196 232C176 220 154 206 134 188C148 186 156 182 160 178Z",
      mouthPath: "M74 130C62 130 56 136 54 144",
      gillPath: "M142 104C154 120 154 146 144 164",
      eyeX: 118,
      eyeY: 112
    };
  }

  if (silhouette === "shark") {
    return {
      bodyPath: "M56 128C80 94 140 76 226 78C278 80 332 92 382 114C364 134 346 150 324 160C296 178 246 190 188 192C130 194 90 178 56 128Z",
      bellyPath: "M122 148C154 166 204 170 254 164C292 160 324 146 350 126C330 160 282 188 214 194C168 196 138 182 122 148Z",
      tailPath: "M374 112C426 92 480 92 504 110C476 128 426 170 378 182C390 162 394 140 374 112Z",
      topFinPath: "M204 82C214 38 238 12 256 18C258 48 270 76 298 104C272 96 240 88 204 82Z",
      bottomFinPath: "M212 162C238 170 268 188 280 212C248 206 220 196 188 176C198 174 206 168 212 162Z",
      mouthPath: "M54 130C42 130 34 136 30 146",
      gillPath: "M128 108C136 122 136 138 128 152",
      eyeX: 106,
      eyeY: 108
    };
  }

  if (silhouette === "torpedo") {
    return {
      bodyPath: "M66 128C76 84 132 54 210 58C274 62 326 90 344 124C328 164 276 190 208 194C126 196 76 172 66 128Z",
      bellyPath: "M108 144C132 166 170 176 214 172C250 170 286 156 312 136C286 172 240 190 184 192C140 192 114 174 108 144Z",
      tailPath: "M340 122C386 102 430 102 446 118C430 134 386 166 346 176C354 160 356 140 340 122Z",
      topFinPath: "M188 62C194 30 214 10 230 12C232 38 242 58 262 82C238 78 212 72 188 62Z",
      bottomFinPath: "M178 166C204 178 224 196 232 216C206 210 180 196 154 180C166 178 174 172 178 166Z",
      mouthPath: "M58 128C48 130 42 136 40 144",
      gillPath: "M126 102C136 116 136 140 126 154",
      eyeX: 100,
      eyeY: 112
    };
  }

  return {
    bodyPath: "M84 130C90 82 136 50 202 50C258 50 302 82 318 120C310 166 266 194 206 198C138 198 92 172 84 130Z",
    bellyPath: "M120 146C140 170 174 184 212 180C244 178 272 162 294 142C268 182 226 198 178 198C142 198 124 180 120 146Z",
    tailPath: "M314 118C356 96 394 94 408 110C394 128 356 158 320 166C330 152 332 136 314 118Z",
    topFinPath: "M174 58C184 26 206 10 222 14C224 42 236 60 256 82C230 76 200 68 174 58Z",
    bottomFinPath: "M168 168C192 182 212 200 214 220C190 212 168 198 146 184C156 180 164 174 168 168Z",
    mouthPath: "M74 128C64 130 58 136 56 144",
    gillPath: "M138 102C150 118 150 146 140 160",
    eyeX: 118,
    eyeY: 112
  };
}

function fishMarks(spec) {
  if (spec.id === "clownfish") {
    return `
      <path d="M136 64C150 94 150 154 136 182" stroke="#fffdf5" stroke-width="26" stroke-linecap="round" opacity="0.96"/>
      <path d="M206 58C220 92 220 156 206 186" stroke="#fffdf5" stroke-width="22" stroke-linecap="round" opacity="0.94"/>
      <path d="M286 72C296 102 296 144 286 170" stroke="#fffdf5" stroke-width="18" stroke-linecap="round" opacity="0.9"/>
      <path d="M136 64C148 92 148 154 136 182" stroke="#1f2331" stroke-width="6" stroke-linecap="round" opacity="0.48"/>
      <path d="M206 58C218 90 218 156 206 186" stroke="#1f2331" stroke-width="6" stroke-linecap="round" opacity="0.48"/>
    `;
  }

  if (spec.id === "blue-tang") {
    return `
      <path d="M136 74C176 58 214 56 250 74C236 90 226 110 224 136C190 148 160 146 130 132C144 112 148 92 136 74Z" fill="#131f38" opacity="0.72"/>
      <path d="M286 104C304 96 322 96 338 104C324 120 322 138 332 152C316 154 300 148 286 136Z" fill="#f3d144" opacity="0.95"/>
    `;
  }

  if (spec.id === "butterfly") {
    return `
      <path d="M134 60C150 98 150 156 136 188" stroke="#151c24" stroke-width="18" stroke-linecap="round" opacity="0.92"/>
      <path d="M230 62C248 92 254 130 246 170" stroke="#1f1a12" stroke-width="10" stroke-linecap="round" opacity="0.48"/>
      <circle cx="116" cy="112" r="22" fill="none" stroke="#16181f" stroke-width="8" opacity="0.45"/>
    `;
  }

  if (spec.id === "puffer") {
    return Array.from({ length: 16 }, (_, index) => {
      const x = 120 + index * 16;
      const y = 82 + (index % 2) * 18;
      return `<circle cx="${x}" cy="${y}" r="${5 + (index % 3)}" fill="#7a5a23" opacity="0.35"/>`;
    }).join("");
  }

  if (spec.id === "lionfish") {
    return `
      <path d="M160 56L152 14M186 52L188 8M212 56L226 14M240 70L268 22M126 150L100 194M154 166L140 214M186 172L184 224" stroke="#6d2f14" stroke-width="6" stroke-linecap="round" opacity="0.64"/>
      <path d="M126 74C164 92 192 110 214 138" stroke="#fff6d4" stroke-width="8" stroke-linecap="round" opacity="0.36"/>
    `;
  }

  if (spec.id === "shark") {
    return `
      <path d="M144 108C152 120 152 136 144 148M162 104C170 118 170 138 162 152M180 102C188 116 188 136 180 150" stroke="#22496c" stroke-width="5" stroke-linecap="round" opacity="0.52"/>
      <path d="M208 92C246 90 286 100 324 122" stroke="#d9eef7" stroke-width="6" stroke-linecap="round" opacity="0.32"/>
    `;
  }

  return `
    <path d="M132 86C186 64 246 70 294 106" stroke="${spec.accent}" stroke-width="16" stroke-linecap="round" opacity="0.22"/>
    <path d="M122 138C182 154 244 148 286 126" stroke="#ffffff" stroke-width="8" stroke-linecap="round" opacity="0.16"/>
  `;
}

function svgFish(spec) {
  const geometry = fishGeometry(spec.silhouette);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="520" height="240" viewBox="0 0 520 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${spec.id}-skin" x1="72" y1="40" x2="330" y2="208" gradientUnits="userSpaceOnUse">
      <stop stop-color="${spec.bodyA}"/>
      <stop offset="0.58" stop-color="${spec.bodyB}"/>
      <stop offset="1" stop-color="${spec.deep}"/>
    </linearGradient>
    <linearGradient id="${spec.id}-belly" x1="126" y1="118" x2="262" y2="202" gradientUnits="userSpaceOnUse">
      <stop stop-color="${spec.belly}"/>
      <stop offset="1" stop-color="${spec.bodyB}"/>
    </linearGradient>
    <linearGradient id="${spec.id}-fin" x1="150" y1="34" x2="246" y2="214" gradientUnits="userSpaceOnUse">
      <stop stop-color="${spec.fin}"/>
      <stop offset="1" stop-color="${spec.accent}"/>
    </linearGradient>
    <radialGradient id="${spec.id}-shine" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(168 88) rotate(24) scale(132 84)">
      <stop stop-color="#ffffff" stop-opacity="0.82"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <filter id="${spec.id}-shadow" x="0" y="0" width="520" height="240" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="18" stdDeviation="14" flood-color="#071a2d" flood-opacity="0.28"/>
    </filter>
  </defs>
  <g filter="url(#${spec.id}-shadow)">
    <path d="${geometry.bodyPath}" fill="url(#${spec.id}-skin)"/>
    <path d="${geometry.bellyPath}" fill="url(#${spec.id}-belly)" opacity="0.92"/>
    <path d="${geometry.tailPath}" fill="url(#${spec.id}-skin)"/>
    <path d="${geometry.topFinPath}" fill="url(#${spec.id}-fin)" opacity="0.92"/>
    <path d="${geometry.bottomFinPath}" fill="url(#${spec.id}-fin)" opacity="0.88"/>
    <path d="${geometry.bodyPath}" fill="url(#${spec.id}-shine)" opacity="0.4"/>
    ${fishMarks(spec)}
    <path d="${geometry.gillPath}" stroke="#233244" stroke-width="5" stroke-linecap="round" opacity="0.42"/>
    <path d="${geometry.mouthPath}" stroke="#243448" stroke-width="4" stroke-linecap="round" opacity="0.48"/>
    <circle cx="${geometry.eyeX}" cy="${geometry.eyeY}" r="15" fill="#ffffff"/>
    <circle cx="${geometry.eyeX + 2}" cy="${geometry.eyeY}" r="7.5" fill="${spec.eye}"/>
    <circle cx="${geometry.eyeX + 5}" cy="${geometry.eyeY - 4}" r="2.4" fill="#ffffff"/>
    <path d="M120 98C184 74 256 78 312 114" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity="0.16"/>
    <path d="M126 124C184 102 256 104 308 132" stroke="#102138" stroke-width="4" stroke-linecap="round" opacity="0.1"/>
  </g>
</svg>`;
}

function trainNosePath(nose) {
  if (nose === "round") {
    return "M68 178C42 172 34 146 40 114C52 68 98 42 160 42H434C474 42 500 58 514 86L526 114V178H68Z";
  }
  if (nose === "bullet") {
    return "M54 178C30 150 34 100 74 74C118 46 174 38 236 38H432C474 38 506 58 518 96L526 122V178H54Z";
  }
  return "M50 178C34 156 38 120 58 88C90 44 152 30 252 30H434C480 30 508 52 520 92L528 122V178H50Z";
}

function svgTrain(spec) {
  const nosePath = trainNosePath(spec.nose);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="520" height="220" viewBox="0 0 620 260" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${spec.id}-shell" x1="70" y1="30" x2="456" y2="214" gradientUnits="userSpaceOnUse">
      <stop stop-color="${spec.shellA}"/>
      <stop offset="0.52" stop-color="${spec.shellB}"/>
      <stop offset="1" stop-color="${spec.shadow}"/>
    </linearGradient>
    <linearGradient id="${spec.id}-stripe" x1="86" y1="120" x2="470" y2="120" gradientUnits="userSpaceOnUse">
      <stop stop-color="${spec.stripe}"/>
      <stop offset="1" stop-color="${spec.stripeLight}"/>
    </linearGradient>
    <linearGradient id="${spec.id}-glass" x1="120" y1="56" x2="272" y2="122" gradientUnits="userSpaceOnUse">
      <stop stop-color="#dff4ff"/>
      <stop offset="1" stop-color="${spec.windowColor}"/>
    </linearGradient>
    <filter id="${spec.id}-shadow" x="0" y="0" width="620" height="260" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="18" stdDeviation="14" flood-color="#091523" flood-opacity="0.26"/>
    </filter>
  </defs>
  <g filter="url(#${spec.id}-shadow)">
    <path d="${nosePath}" fill="url(#${spec.id}-shell)"/>
    <rect x="246" y="44" width="284" height="134" rx="28" fill="url(#${spec.id}-shell)"/>
    <path d="M96 112H516" stroke="url(#${spec.id}-stripe)" stroke-width="20" stroke-linecap="round"/>
    <path d="M98 78C116 56 150 48 186 50C178 78 180 108 196 126H94C92 108 92 94 98 78Z" fill="url(#${spec.id}-glass)" opacity="0.92"/>
    <rect x="134" y="64" width="42" height="32" rx="10" fill="${spec.windowColor}" opacity="0.86"/>
    <rect x="210" y="60" width="34" height="58" rx="12" fill="${spec.windowColor}" opacity="0.82"/>
    <rect x="268" y="66" width="42" height="30" rx="10" fill="${spec.windowColor}" opacity="0.84"/>
    <rect x="324" y="66" width="42" height="30" rx="10" fill="${spec.windowColor}" opacity="0.82"/>
    <rect x="380" y="66" width="42" height="30" rx="10" fill="${spec.windowColor}" opacity="0.8"/>
    <rect x="436" y="66" width="42" height="30" rx="10" fill="${spec.windowColor}" opacity="0.78"/>
    <rect x="492" y="58" width="24" height="74" rx="10" fill="#edf5ff" opacity="0.44"/>
    <path d="M84 50H472" stroke="#ffffff" stroke-width="10" stroke-linecap="round" opacity="0.14"/>
    <path d="M118 94H510" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.22"/>
    <path d="M108 150H514" stroke="#1a2432" stroke-width="8" stroke-linecap="round" opacity="0.36"/>
    <rect x="150" y="166" width="318" height="12" rx="6" fill="#28313f" opacity="0.72"/>
    <circle cx="194" cy="188" r="21" fill="#273447"/>
    <circle cx="194" cy="188" r="10" fill="#91a6bb"/>
    <circle cx="412" cy="188" r="21" fill="#273447"/>
    <circle cx="412" cy="188" r="10" fill="#91a6bb"/>
    <circle cx="84" cy="114" r="10" fill="#fff4bf" opacity="0.86"/>
    <circle cx="104" cy="120" r="7" fill="#fff9df" opacity="0.6"/>
    <path d="M104 42H458" stroke="#5d6b7b" stroke-width="7" stroke-linecap="round" opacity="0.36"/>
    <text x="522" y="170" fill="#ffffff" font-size="24" font-weight="700" font-family="Segoe UI, Arial, sans-serif">${spec.badge}</text>
  </g>
</svg>`;
}

function svgBackdrop(theme) {
  if (theme === "ocean") {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1600" height="900" viewBox="0 0 1600 900" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sea-bg" x1="0" y1="0" x2="1600" y2="900" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0b7695"/>
      <stop offset="0.34" stop-color="#094f78"/>
      <stop offset="0.74" stop-color="#08395d"/>
      <stop offset="1" stop-color="#031f34"/>
    </linearGradient>
    <radialGradient id="sea-light" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1180 126) rotate(116) scale(540 360)">
      <stop stop-color="#fff4be" stop-opacity="0.52"/>
      <stop offset="1" stop-color="#fff4be" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#sea-bg)"/>
  <ellipse cx="1160" cy="122" rx="520" ry="330" fill="url(#sea-light)"/>
  <path d="M1050 -20L1220 500" stroke="#ffffff" stroke-opacity="0.12" stroke-width="64" stroke-linecap="round"/>
  <path d="M1170 -40L1340 510" stroke="#ffffff" stroke-opacity="0.08" stroke-width="52" stroke-linecap="round"/>
  <path d="M1260 -20L1430 498" stroke="#d1f8ff" stroke-opacity="0.08" stroke-width="48" stroke-linecap="round"/>
  <g opacity="0.24">
    <path d="M0 674C132 652 272 684 392 718C546 762 706 760 846 720C994 678 1128 646 1280 672C1390 690 1500 736 1600 750" stroke="#8fe6ff" stroke-width="12" stroke-linecap="round"/>
    <path d="M-20 724C112 704 258 724 396 754C560 790 706 790 860 756C1002 726 1146 714 1288 736C1400 754 1502 792 1620 804" stroke="#d6fbff" stroke-opacity="0.52" stroke-width="9" stroke-linecap="round"/>
  </g>
  <path d="M0 710C120 676 226 676 332 716C432 754 560 776 692 748C822 718 926 676 1040 680C1186 686 1346 746 1600 792V900H0V710Z" fill="#0d4462" fill-opacity="0.72"/>
  <path d="M0 792C150 754 288 760 434 804C608 856 758 858 926 822C1088 788 1230 774 1600 842V900H0V792Z" fill="#0d2d44" fill-opacity="0.9"/>
  <path d="M66 900C110 760 152 706 204 698C232 694 256 712 282 742C250 752 228 778 208 900H66Z" fill="#d16aa1" fill-opacity="0.42"/>
  <path d="M212 900C256 764 300 708 352 700C382 696 408 716 438 748C406 760 380 790 360 900H212Z" fill="#ff9d7c" fill-opacity="0.34"/>
  <path d="M1280 900C1328 746 1388 694 1452 706C1488 712 1518 742 1546 780C1502 786 1470 820 1452 900H1280Z" fill="#f07e6c" fill-opacity="0.36"/>
  <circle cx="212" cy="164" r="14" fill="#d6fbff" fill-opacity="0.18"/>
  <circle cx="254" cy="208" r="9" fill="#d6fbff" fill-opacity="0.16"/>
  <circle cx="142" cy="246" r="7" fill="#d6fbff" fill-opacity="0.12"/>
  <circle cx="1396" cy="236" r="8" fill="#d6fbff" fill-opacity="0.14"/>
</svg>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1600" height="900" viewBox="0 0 1600 900" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="station-bg" x1="0" y1="0" x2="1600" y2="900" gradientUnits="userSpaceOnUse">
      <stop stop-color="#f2e7d7"/>
      <stop offset="0.38" stop-color="#dce6ee"/>
      <stop offset="0.78" stop-color="#b7cad8"/>
      <stop offset="1" stop-color="#7d8d98"/>
    </linearGradient>
    <linearGradient id="roof" x1="0" y1="0" x2="1600" y2="0" gradientUnits="userSpaceOnUse">
      <stop stop-color="#4a5965"/>
      <stop offset="1" stop-color="#26323c"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#station-bg)"/>
  <path d="M0 84H1600V134H0V84Z" fill="url(#roof)"/>
  <path d="M90 134L280 588H244L54 134H90Z" fill="#5a6875" fill-opacity="0.74"/>
  <path d="M460 134L610 588H574L424 134H460Z" fill="#5a6875" fill-opacity="0.7"/>
  <path d="M830 134L940 588H904L794 134H830Z" fill="#5a6875" fill-opacity="0.66"/>
  <path d="M1190 134L1284 588H1248L1154 134H1190Z" fill="#5a6875" fill-opacity="0.68"/>
  <rect x="0" y="574" width="1600" height="154" fill="#cab8a5"/>
  <rect x="0" y="728" width="1600" height="172" fill="#767d84"/>
  <rect x="0" y="710" width="1600" height="12" fill="#fff0b8"/>
  <rect x="0" y="820" width="1600" height="10" fill="#fff0b8" fill-opacity="0.76"/>
  <path d="M0 782H1600" stroke="#313941" stroke-width="34"/>
  <path d="M0 862H1600" stroke="#313941" stroke-width="34"/>
  <path d="M138 782V900M278 782V900M418 782V900M558 782V900M698 782V900M838 782V900M978 782V900M1118 782V900M1258 782V900M1398 782V900" stroke="#44342b" stroke-width="16"/>
  <rect x="170" y="204" width="206" height="88" rx="18" fill="#264050" opacity="0.92"/>
  <rect x="1160" y="188" width="228" height="96" rx="18" fill="#173343" opacity="0.88"/>
  <text x="206" y="258" fill="#ffffff" font-size="30" font-weight="700" font-family="Segoe UI, Arial, sans-serif">TOKYO LINE</text>
  <text x="1212" y="246" fill="#ffffff" font-size="30" font-weight="700" font-family="Segoe UI, Arial, sans-serif">PLATFORM</text>
  <path d="M1030 584C1088 548 1164 538 1248 548C1316 556 1378 586 1444 638C1366 652 1288 656 1210 646C1134 638 1074 620 1030 584Z" fill="#f0f4f8" fill-opacity="0.44"/>
  <path d="M1048 602C1116 570 1186 564 1262 572C1322 578 1382 600 1442 638C1362 646 1290 648 1218 640C1150 632 1094 620 1048 602Z" fill="#557089" fill-opacity="0.44"/>
  <path d="M0 654C216 622 454 626 668 650C922 680 1164 682 1600 646V682C1172 718 918 720 654 690C434 664 212 660 0 696V654Z" fill="#ffffff" fill-opacity="0.08"/>
</svg>`;
}

function svgStamp() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="360" height="160" viewBox="0 0 360 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="stamp-grad" x1="20" y1="12" x2="320" y2="140" gradientUnits="userSpaceOnUse">
      <stop stop-color="#fff3bf"/>
      <stop offset="0.45" stop-color="#ffd1df"/>
      <stop offset="1" stop-color="#c7f6ff"/>
    </linearGradient>
    <filter id="stamp-shadow" x="0" y="0" width="360" height="160" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#00112a" flood-opacity="0.18"/>
    </filter>
  </defs>
  <g filter="url(#stamp-shadow)">
    <rect x="18" y="20" width="324" height="120" rx="34" fill="url(#stamp-grad)"/>
    <rect x="32" y="34" width="296" height="92" rx="28" stroke="#ffffff" stroke-width="4" stroke-dasharray="6 8"/>
    <text x="72" y="74" fill="#21405a" font-size="22" font-weight="800" font-family="Trebuchet MS, Segoe UI, sans-serif">SEOJUN &amp; SEOJIN</text>
    <text x="84" y="106" fill="#8f385d" font-size="22" font-weight="700" font-family="Trebuchet MS, Segoe UI, sans-serif">SPECIAL ARCADE</text>
  </g>
</svg>`;
}

function noteFrequency(note) {
  const map = {
    C4: 261.63,
    D4: 293.66,
    E4: 329.63,
    F4: 349.23,
    G4: 392.0,
    A4: 440.0,
    B4: 493.88,
    C5: 523.25,
    D5: 587.33,
    E5: 659.25,
    F5: 698.46,
    G5: 783.99,
    A5: 880.0,
    B5: 987.77
  };
  return map[note] || 440;
}

function synthTrack({ notes, tempo = 116, seconds = 8, wave = "sine", volume = 0.28, echo = 0.14 }) {
  const sampleRate = 22050;
  const totalSamples = Math.floor(sampleRate * seconds);
  const samples = new Float32Array(totalSamples);
  const beatLength = 60 / tempo;

  function oscillator(kind, frequency, time) {
    const phase = 2 * Math.PI * frequency * time;
    if (kind === "triangle") {
      return 2 * Math.asin(Math.sin(phase)) / Math.PI;
    }
    if (kind === "square") {
      return Math.sign(Math.sin(phase)) * 0.75;
    }
    return Math.sin(phase);
  }

  notes.forEach((event) => {
    const startSample = Math.floor(sampleRate * beatLength * event.start);
    const durationSamples = Math.floor(sampleRate * beatLength * event.length);
    const frequency = noteFrequency(event.note);
    const gain = event.gain ?? volume;
    const kind = event.wave || wave;

    for (let i = 0; i < durationSamples && startSample + i < totalSamples; i += 1) {
      const t = i / sampleRate;
      const envelope = Math.exp(-3.2 * (i / durationSamples)) * Math.sin(Math.PI * clamp(i / durationSamples, 0, 1));
      samples[startSample + i] += oscillator(kind, frequency, t) * envelope * gain;
      const echoIndex = startSample + i + Math.floor(sampleRate * 0.12);
      if (echoIndex < totalSamples) {
        samples[echoIndex] += oscillator(kind, frequency * 0.5, t) * envelope * gain * echo;
      }
    }
  });

  return writeWav(samples, sampleRate);
}

function synthSweep({ startFreq, endFreq, duration = 0.5, wave = "sine", volume = 0.4 }) {
  const sampleRate = 22050;
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i += 1) {
    const progress = i / totalSamples;
    const frequency = startFreq + (endFreq - startFreq) * progress;
    const time = i / sampleRate;
    const envelope = Math.sin(Math.PI * progress) * Math.exp(-2.2 * progress);
    const phase = 2 * Math.PI * frequency * time;
    const value = wave === "triangle"
      ? 2 * Math.asin(Math.sin(phase)) / Math.PI
      : wave === "square"
        ? Math.sign(Math.sin(phase)) * 0.65
        : Math.sin(phase);
    samples[i] = value * envelope * volume;
  }

  return writeWav(samples, sampleRate);
}

function writeWav(floatSamples, sampleRate) {
  const dataSize = floatSamples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < floatSamples.length; i += 1) {
    const sample = Math.round(clamp(floatSamples[i], -1, 1) * 32767);
    buffer.writeInt16LE(sample, 44 + i * 2);
  }

  return buffer;
}

function writeAudio(filePath, buffer) {
  ensureDir(filePath);
  writeFileSync(filePath, buffer);
}

const fishes = [
  { id: "goldfish", bodyA: "#f6d06a", bodyB: "#eb8a46", deep: "#9f451d", belly: "#ffe4b0", fin: "#ffbb6f", accent: "#fff2cb", eye: "#16253c", silhouette: "round" },
  { id: "clownfish", bodyA: "#f78e3d", bodyB: "#ea5e2d", deep: "#8b2e1a", belly: "#ffc782", fin: "#ffb15c", accent: "#fff6d2", eye: "#16253c", silhouette: "round" },
  { id: "blue-tang", bodyA: "#3fb2ff", bodyB: "#1657b7", deep: "#0f2d6f", belly: "#9ddfff", fin: "#f2d540", accent: "#dff7ff", eye: "#182747", silhouette: "torpedo" },
  { id: "puffer", bodyA: "#ecd79a", bodyB: "#c79b52", deep: "#6c4d22", belly: "#fff1cc", fin: "#f6e6b6", accent: "#8c682b", eye: "#1f2b3b", silhouette: "tall" },
  { id: "butterfly", bodyA: "#fff3c8", bodyB: "#efc23f", deep: "#9a6f10", belly: "#fff9df", fin: "#f7d15f", accent: "#ffe48e", eye: "#1e222d", silhouette: "tall" },
  { id: "angelfish", bodyA: "#d2f5ff", bodyB: "#75c6d3", deep: "#2c7284", belly: "#eefcff", fin: "#f7a1ba", accent: "#ffffff", eye: "#1f2c3f", silhouette: "tall" },
  { id: "lionfish", bodyA: "#ffd3bb", bodyB: "#e67e3b", deep: "#7a361b", belly: "#fff0d9", fin: "#8e401e", accent: "#fff6df", eye: "#2e2930", silhouette: "spiny" },
  { id: "shark", bodyA: "#8db5d1", bodyB: "#4f7aa1", deep: "#274b6d", belly: "#dbeef7", fin: "#aacbe0", accent: "#ffffff", eye: "#172233", silhouette: "shark" }
];

const trains = [
  { id: "yamanote", shellA: "#ebeff2", shellB: "#c0cad4", shadow: "#7d8b97", stripe: "#8fd255", stripeLight: "#d7ffba", windowColor: "#253749", nose: "round", badge: "YAM" },
  { id: "nozomi", shellA: "#fbfdff", shellB: "#dde6f2", shadow: "#8f9daf", stripe: "#2c66ba", stripeLight: "#7fb2ff", windowColor: "#243d56", nose: "sharp", badge: "N700" },
  { id: "hayabusa", shellA: "#1e8a7c", shellB: "#18566a", shadow: "#10313e", stripe: "#df4f63", stripeLight: "#ff93a0", windowColor: "#16283d", nose: "bullet", badge: "E5" },
  { id: "komachi", shellA: "#ffffff", shellB: "#e4e8f1", shadow: "#9aa3b4", stripe: "#eb4d59", stripeLight: "#ff9ea6", windowColor: "#2f3c55", nose: "bullet", badge: "E6" },
  { id: "narita-express", shellA: "#f5f5f7", shellB: "#c7c9cf", shadow: "#868892", stripe: "#b01f34", stripeLight: "#ef6c81", windowColor: "#1d242c", nose: "round", badge: "NEX" },
  { id: "kagayaki", shellA: "#fbfbff", shellB: "#dce1ed", shadow: "#8d97a7", stripe: "#4d74cc", stripeLight: "#8fb2ff", windowColor: "#24354b", nose: "sharp", badge: "W7" },
  { id: "thomas", shellA: "#4e9ce2", shellB: "#2d6cba", shadow: "#1e4276", stripe: "#f2d35d", stripeLight: "#ffeaa5", windowColor: "#eff9ff", nose: "round", badge: "THO" },
  { id: "dr-yellow", shellA: "#ffd753", shellB: "#f0b321", shadow: "#996d08", stripe: "#5783d6", stripeLight: "#a2c3ff", windowColor: "#405979", nose: "sharp", badge: "923" },
  { id: "spacia-x", shellA: "#f2f2ee", shellB: "#c4bfb2", shadow: "#7b746a", stripe: "#463321", stripeLight: "#8d7258", windowColor: "#243149", nose: "round", badge: "SPX" },
  { id: "sunrise", shellA: "#f5eee4", shellB: "#d0b59d", shadow: "#8e7058", stripe: "#a5533f", stripeLight: "#d58a73", windowColor: "#4b3932", nose: "round", badge: "285" }
];

fishes.forEach((fish) => {
  writeText(join(rootDir, "src/assets/images/ocean", `${fish.id}.svg`), svgFish(fish));
});

trains.forEach((train) => {
  writeText(join(rootDir, "src/assets/images/train", `${train.id}.svg`), svgTrain(train));
});

writeText(join(rootDir, "src/assets/images/ocean", "backdrop.svg"), svgBackdrop("ocean"));
writeText(join(rootDir, "src/assets/images/train", "backdrop.svg"), svgBackdrop("train"));
writeText(join(rootDir, "src/assets/images/shared", "seojun-seojin-stamp.svg"), svgStamp());

writeAudio(
  join(rootDir, "src/assets/audio/bgm", "ocean-loop.wav"),
  synthTrack({
    tempo: 110,
    seconds: 8,
    wave: "triangle",
    volume: 0.25,
    notes: [
      { note: "C4", start: 0, length: 2.5, gain: 0.18 },
      { note: "G4", start: 0, length: 2, gain: 0.12 },
      { note: "E4", start: 1, length: 1.5, gain: 0.15 },
      { note: "A4", start: 2, length: 1.5, gain: 0.12 },
      { note: "G4", start: 3, length: 1.8, gain: 0.15 },
      { note: "E5", start: 4, length: 1.2, gain: 0.16 },
      { note: "D5", start: 5, length: 1.2, gain: 0.14 },
      { note: "C5", start: 6, length: 1.8, gain: 0.16 },
      { note: "G4", start: 0.5, length: 0.5, gain: 0.08, wave: "sine" },
      { note: "A4", start: 2.5, length: 0.5, gain: 0.08, wave: "sine" },
      { note: "G4", start: 4.5, length: 0.5, gain: 0.08, wave: "sine" },
      { note: "E4", start: 6.5, length: 0.5, gain: 0.08, wave: "sine" }
    ]
  })
);

writeAudio(
  join(rootDir, "src/assets/audio/bgm", "train-loop.wav"),
  synthTrack({
    tempo: 128,
    seconds: 8,
    wave: "square",
    volume: 0.22,
    notes: [
      { note: "C4", start: 0, length: 0.75, gain: 0.12 },
      { note: "E4", start: 0.75, length: 0.75, gain: 0.12 },
      { note: "G4", start: 1.5, length: 0.75, gain: 0.12 },
      { note: "C5", start: 2.25, length: 0.75, gain: 0.14 },
      { note: "G4", start: 3, length: 0.75, gain: 0.12 },
      { note: "A4", start: 3.75, length: 0.75, gain: 0.12 },
      { note: "G4", start: 4.5, length: 0.75, gain: 0.12 },
      { note: "E4", start: 5.25, length: 0.75, gain: 0.12 },
      { note: "F4", start: 6, length: 0.75, gain: 0.11 },
      { note: "G4", start: 6.75, length: 0.75, gain: 0.12 },
      { note: "C5", start: 7.5, length: 0.5, gain: 0.14 }
    ]
  })
);

writeAudio(
  join(rootDir, "src/assets/audio/bgm", "boss-tension.wav"),
  synthTrack({
    tempo: 138,
    seconds: 8,
    wave: "triangle",
    volume: 0.2,
    notes: [
      { note: "C4", start: 0, length: 0.5, gain: 0.11 },
      { note: "D4", start: 0.5, length: 0.5, gain: 0.11 },
      { note: "E4", start: 1, length: 0.5, gain: 0.12 },
      { note: "G4", start: 1.5, length: 0.5, gain: 0.13 },
      { note: "A4", start: 2, length: 0.5, gain: 0.13 },
      { note: "G4", start: 2.5, length: 0.5, gain: 0.12 },
      { note: "E4", start: 3, length: 0.5, gain: 0.11 },
      { note: "D4", start: 3.5, length: 0.5, gain: 0.11 },
      { note: "C4", start: 4, length: 0.5, gain: 0.12 },
      { note: "C5", start: 4.5, length: 0.5, gain: 0.13 },
      { note: "B4", start: 5, length: 0.5, gain: 0.13 },
      { note: "A4", start: 5.5, length: 0.5, gain: 0.12 },
      { note: "G4", start: 6, length: 0.5, gain: 0.12 },
      { note: "E4", start: 6.5, length: 0.5, gain: 0.11 },
      { note: "D4", start: 7, length: 0.5, gain: 0.11 },
      { note: "C4", start: 7.5, length: 0.5, gain: 0.12 }
    ]
  })
);

[
  ["success.wav", synthSweep({ startFreq: 440, endFreq: 980, duration: 0.62, wave: "triangle", volume: 0.36 })],
  ["error.wav", synthSweep({ startFreq: 360, endFreq: 150, duration: 0.42, wave: "square", volume: 0.32 })],
  ["select.wav", synthSweep({ startFreq: 520, endFreq: 740, duration: 0.22, wave: "triangle", volume: 0.28 })],
  ["snap.wav", synthSweep({ startFreq: 820, endFreq: 120, duration: 0.34, wave: "square", volume: 0.36 })],
  ["countdown.wav", synthSweep({ startFreq: 880, endFreq: 680, duration: 0.18, wave: "square", volume: 0.2 })],
  ["boss.wav", synthSweep({ startFreq: 180, endFreq: 760, duration: 1.1, wave: "triangle", volume: 0.42 })],
  ["fanfare.wav", synthTrack({
    tempo: 140,
    seconds: 2.6,
    wave: "triangle",
    volume: 0.26,
    notes: [
      { note: "C4", start: 0, length: 0.5, gain: 0.18 },
      { note: "E4", start: 0.5, length: 0.5, gain: 0.18 },
      { note: "G4", start: 1, length: 0.5, gain: 0.18 },
      { note: "C5", start: 1.5, length: 0.9, gain: 0.22 },
      { note: "E5", start: 1.75, length: 0.7, gain: 0.16 }
    ]
  })]
].forEach(([fileName, buffer]) => {
  writeAudio(join(rootDir, "src/assets/audio/sfx", fileName), buffer);
});

writeAudio(
  join(rootDir, "src/assets/audio/voice", "voice-bed.wav"),
  synthTrack({
    tempo: 104,
    seconds: 4,
    wave: "triangle",
    volume: 0.08,
    notes: [
      { note: "C5", start: 0, length: 0.75, gain: 0.07 },
      { note: "E5", start: 0.75, length: 0.75, gain: 0.07 },
      { note: "G5", start: 1.5, length: 0.75, gain: 0.07 },
      { note: "E5", start: 2.25, length: 0.75, gain: 0.07 }
    ]
  })
);

console.log("Assets generated.");
