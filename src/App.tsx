import { useState } from 'react';
import CodeBlock from '@/components/CodeBlock';
import Note from '@/components/Note';
import Checklist from '@/components/Checklist';
import ResourceBar from '@/components/ResourceBar';
import NightModeTimeline from '@/components/NightModeTimeline';
import BrowserBar from '@/components/BrowserBar';
import { deriveVMIPs } from '@/utils/network';

/* ──────────────────────────────────────────
   메인 앱
────────────────────────────────────────── */
export default function App() {
  /* ── 네트워크 설정 상태 ── */
  const [netConfig, setNetConfig] = useState({
    proxmoxIP: '10.179.93.200',
    prefix:    '24',
    gateway:   '10.179.93.62',
    dns:       '10.179.93.62',
  });

  /* ── 파생 변수 ── */
  const { nasIP, aiIP, winIP } = deriveVMIPs(netConfig.proxmoxIP);
  const pxIP = netConfig.proxmoxIP;
  const pfx  = netConfig.prefix;
  const gw   = netConfig.gateway;
  const dns  = netConfig.dns;

  /* ── UI 상태 ── */
  const [activeStep, setActiveStep] = useState(0);
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));
  const [ramPhase, setRamPhase] = useState<'now' | 'after'>('now');

  const toggleSection = (i: number) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };
  const goTo = (id: number) => { setActiveStep(id); setOpenSections(new Set([0])); };

  /* ──────────────────────────────────────────
     STEPS (netConfig 클로저 참조)
  ────────────────────────────────────────── */
  const STEPS = [
    /* ══════════════════════════════════════ STEP 0 준비물 */
    {
      id: 0, title: '준비물', subtitle: 'USB 32GB 1개로 전부 해결!', icon: '📦', color: 'from-slate-500 to-slate-600',
      sections: [
        {
          title: '✅ 필요한 준비물 체크리스트',
          body: () => (
            <>
              <div className="my-3 p-4 bg-emerald-900/20 rounded-xl border border-emerald-500/40">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🎉</span>
                  <span className="font-bold text-emerald-300 text-sm">USB 1개로 모든 OS를 한 번에 담는 방법: Ventoy</span>
                </div>
                <p className="text-slate-300 text-sm">Ventoy는 USB에 ISO 파일을 그냥 복사·붙여넣기만 하면 부팅 메뉴가 자동으로 생기는 무료 오픈소스 툴입니다. 4개 ISO 전부 32GB USB 1개에 담아서 순서대로 설치할 수 있습니다.</p>
              </div>
              <div className="my-4 p-4 bg-slate-800/60 rounded-xl border border-slate-700">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-3">📐 32GB USB 용량 계산</p>
                {[
                  { name: 'Proxmox VE 8.x ISO',         size: 1.2, color: 'bg-orange-500' },
                  { name: 'Ubuntu Server 24.04 ISO',     size: 2.6, color: 'bg-blue-500'   },
                  { name: 'Windows 11 Pro ISO',          size: 5.8, color: 'bg-cyan-500'   },
                  { name: 'VirtIO 드라이버 ISO',          size: 0.6, color: 'bg-purple-500' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 mb-2">
                    <div className="w-36 flex-shrink-0 text-xs text-slate-300">{f.name}</div>
                    <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${f.color}`} style={{ width: `${(f.size / 32) * 100}%` }} />
                    </div>
                    <div className="w-12 text-right text-xs font-mono text-slate-400">{f.size} GB</div>
                  </div>
                ))}
                <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between items-center">
                  <span className="text-sm text-slate-300">합계 사용량</span>
                  <span className="font-black text-emerald-400 text-lg">10.2 GB <span className="text-sm font-normal text-slate-500">/ 32 GB</span></span>
                </div>
                <div className="mt-2 h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500" style={{ width: '32%' }} />
                </div>
                <p className="text-xs text-emerald-400 mt-2 text-right">약 21.8 GB 여유 공간 — 충분합니다! ✓</p>
              </div>
              <Checklist items={[
                'USB 32GB 1개 준비 (USB 3.0 이상 권장)',
                '인터넷 연결된 PC (다운로드용)',
                'Ventoy 다운로드 및 설치 (아래 가이드 참고)',
                'ISO 4개 다운로드 후 USB에 복사',
                '모니터 + 키보드 (최초 설치 때만 필요)',
                'LAN 케이블 연결 권장 (Wi-Fi보다 안정적)',
              ]} />
            </>
          ),
        },
        {
          title: '① Ventoy 설치하기 (USB 멀티부팅 준비)',
          body: () => (
            <div className="space-y-3">
              <p className="text-slate-300 text-sm">Ventoy는 USB를 한 번만 포맷하면 이후엔 ISO 파일을 그냥 복붙하기만 하면 됩니다.</p>
              <div className="flex flex-col gap-2">
                <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-cyan-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">1</span>
                    <span className="font-semibold text-white text-sm">Ventoy 다운로드</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2 ml-7">Windows용(ventoy-x.x.x-windows.zip) 다운로드</p>
                  <a href="https://github.com/ventoy/Ventoy/releases" target="_blank" rel="noopener noreferrer"
                    className="ml-7 inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                    Ventoy 다운로드 →
                  </a>
                </div>
              </div>
              <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 text-sm text-slate-300 space-y-2.5">
                {[
                  ['2', '다운로드한 zip 파일 압축 해제'],
                  ['3', 'USB 32GB를 PC에 꽂기'],
                  ['4', '압축 해제 폴더 안의 Ventoy2Disk.exe 실행 (관리자 권한)'],
                  ['5', 'Device 항목에서 USB 선택 (PC 내장 드라이브 선택 주의!)'],
                  ['6', 'Partition Style → GPT 선택 (UEFI 부팅용)'],
                  ['7', 'Install 버튼 클릭 → 경고창 확인 → 완료'],
                ].map(([n, t]) => (
                  <div key={n} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">{n}</span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
              <Note type="warn">USB 안의 기존 파일이 모두 삭제됩니다. 중요한 파일은 미리 백업하세요.</Note>
              <Note type="tip">설치 완료 후 USB를 보면 드라이브가 2개로 나뉩니다. 큰 파티션(ventoy)에 ISO 파일을 복사하면 됩니다.</Note>
            </div>
          ),
        },
        {
          title: '② ISO 파일 다운로드 & USB에 복사',
          body: () => (
            <div className="space-y-2">
              <p className="text-slate-300 text-sm mb-3">아래 4개를 모두 다운로드한 뒤, USB의 <strong className="text-cyan-400">ventoy</strong> 파티션에 그냥 복붙하면 끝입니다.</p>
              {[
                { name: '① Proxmox VE 8.x ISO',            url: 'https://www.proxmox.com/en/downloads',                                                                           desc: '약 1.2 GB · 베어메탈 하이퍼바이저',             size: '~1.2 GB', color: 'border-orange-500/50 bg-orange-900/10' },
                { name: '② Ubuntu Server 24.04 LTS ISO',   url: 'https://ubuntu.com/download/server',                                                                             desc: '약 2.6 GB · NAS + AI VM용 (1개로 2번 사용)',    size: '~2.6 GB', color: 'border-blue-500/50 bg-blue-900/10'   },
                { name: '③ Windows 11 ISO (MS 공식)',       url: 'https://www.microsoft.com/ko-kr/software-download/windows11',                                                    desc: '약 5.8 GB · 개발·작업용 VM',                    size: '~5.8 GB', color: 'border-cyan-500/50 bg-cyan-900/10'   },
                { name: '④ VirtIO 드라이버 ISO',            url: 'https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/stable-virtio/virtio-win.iso',                  desc: '약 0.6 GB · Windows VM 필수 드라이버',          size: '~0.6 GB', color: 'border-purple-500/50 bg-purple-900/10' },
              ].map((item, i) => (
                <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
                  className={`flex items-center justify-between p-3 rounded-lg border ${item.color} hover:brightness-125 transition-all group`}>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">{item.name}</div>
                    <div className="text-xs text-slate-500">{item.desc}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400">{item.size}</span>
                    <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">↗</span>
                  </div>
                </a>
              ))}
              <div className="mt-4 p-4 bg-slate-800 rounded-xl border border-slate-700">
                <p className="text-sm font-semibold text-white mb-2">📂 USB 최종 파일 구조</p>
                <pre className="text-xs font-mono text-green-300 leading-relaxed">{`USB (ventoy 파티션)\n├── proxmox-ve_8.x-1.iso\n├── ubuntu-24.04-live-server-amd64.iso\n├── Win11_23H2_Korean_x64.iso\n└── virtio-win.iso`}</pre>
              </div>
              <Note type="tip">파일을 USB에 복사한 후 PC를 재부팅하고 USB로 부팅하면 Ventoy 메뉴가 자동으로 나타납니다.</Note>
            </div>
          ),
        },
        {
          title: '③ Ventoy 부팅 메뉴 사용법',
          body: () => (
            <div className="space-y-3">
              <p className="text-slate-300 text-sm">PC에 USB를 꽂고 재부팅 후 BIOS 부팅 메뉴(보통 F11 또는 F12)에서 USB 선택 → Ventoy 메뉴 진입</p>
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-600 font-mono text-sm">
                <div className="text-slate-500 text-xs mb-2">[ Ventoy 부팅 메뉴 화면 ]</div>
                <div className="space-y-1">
                  {[
                    { name: 'proxmox-ve_8.x-1.iso',                active: true,  order: '1번째 설치'     },
                    { name: 'ubuntu-24.04-live-server-amd64.iso',   active: false, order: '2번째·3번째 사용' },
                    { name: 'Win11_23H2_Korean_x64.iso',            active: false, order: '4번째 설치'     },
                    { name: 'virtio-win.iso',                       active: false, order: 'Windows 드라이버' },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center justify-between px-3 py-1.5 rounded ${item.active ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>
                      <span>{item.active ? '▶ ' : '  '}{item.name}</span>
                      <span className="text-xs opacity-60">{item.order}</span>
                    </div>
                  ))}
                </div>
                <div className="text-slate-600 text-xs mt-2">↑↓ 선택{'   '}Enter 부팅</div>
              </div>
              <Note type="info">Ubuntu ISO는 NAS VM(VM1)과 AI VM(VM2) 두 번 사용됩니다. ISO를 한 번만 다운로드하면 USB에서 2번 재사용 가능합니다.</Note>
            </div>
          ),
        },
      ],
    },

    /* ══════════════════════════════════════ STEP 1 Proxmox */
    {
      id: 1, title: 'Proxmox VE 설치', subtitle: '베어메탈 하이퍼바이저', icon: '⚙️', color: 'from-orange-500 to-amber-500',
      sections: [
        {
          title: 'Proxmox VE란?',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-3">PC 전체를 '가상머신 공장'으로 만드는 소프트웨어입니다. 설치 후 웹 브라우저에서 VM을 생성·관리할 수 있습니다.</p>
              <Checklist items={[
                'USB(Ventoy)를 PC에 꽂고 재부팅 → F11/F12로 USB 부팅 선택',
                'Ventoy 메뉴에서 proxmox-ve ISO 선택 → Enter',
                '설치 마법사 진행 (아래 설정값 참고)',
                '설치 완료 후 USB 제거 없이 재부팅 (Ventoy 메뉴에서 HDD 선택)',
                `웹 관리 페이지 접속 확인 (https://${pxIP}:8006)`,
              ]} />
            </>
          ),
        },
        {
          title: '설치 시 주요 입력값',
          body: () => (
            <>
              <Note type="info">상단 <strong>🔧 내 네트워크 설정</strong>에서 IP를 미리 입력해두면 아래 값이 자동으로 채워집니다. 설치 화면에서 그대로 입력하세요.</Note>
              <div className="grid grid-cols-2 gap-2 my-3">
                {[
                  ['설치 대상 디스크',    '512GB M.2 SSD 선택'],
                  ['파일시스템',          'ext4 (기본값 유지)'],
                  ['국가 / 타임존',       'Korea / Asia/Seoul'],
                  ['호스트이름',          'homelab.local'],
                  ['관리 IP 주소 (CIDR)', `${pxIP}/${pfx}`],
                  ['게이트웨이',          gw],
                  ['DNS 서버',           dns],
                  ['root 비밀번호',       '기억하기 쉬운 강력한 값'],
                ].map(([k, v], i) => (
                  <div key={i} className={`p-2 bg-slate-800 rounded-lg border ${['관리 IP 주소 (CIDR)', '게이트웨이', 'DNS 서버'].includes(k) ? 'border-cyan-600/50' : 'border-slate-700'}`}>
                    <div className="text-xs text-slate-500 mb-0.5">{k}</div>
                    <div className={`text-sm font-mono ${['관리 IP 주소 (CIDR)', '게이트웨이', 'DNS 서버'].includes(k) ? 'text-cyan-300' : 'text-amber-400'}`}>{v}</div>
                  </div>
                ))}
              </div>
              <Note type="tip">관리 IP·게이트웨이·DNS는 처음부터 실제(운영) 값으로 입력합니다. 설치 완료 즉시 해당 IP로 웹 UI 접속이 가능합니다.</Note>
            </>
          ),
        },
        {
          title: '설치 완료 후 — 물리 콘솔 로그인 (CMD 창)',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-3">
                Proxmox 설치 완료 후 재부팅하면 모니터에 아래와 같은 <strong>텍스트 콘솔</strong>이 나타납니다.
                이 화면이 Proxmox의 "CMD 창"입니다.
              </p>
              <div className="my-3 rounded-xl overflow-hidden border border-slate-600">
                <div className="bg-slate-800 px-4 py-2 text-xs text-slate-400 font-mono flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="ml-2">Proxmox VE — 물리 콘솔 화면</span>
                </div>
                <pre className="bg-black p-4 text-sm font-mono text-green-400 leading-relaxed">{`Proxmox Virtual Environment 8.x.x\nhomelab.local login: _`}</pre>
              </div>

              <p className="text-slate-300 text-sm font-semibold mb-2">① 로그인</p>
              <CodeBlock label="물리 콘솔 — 로그인" code={`# 사용자명 입력 후 Enter\nhomelab.local login: root\n\n# 비밀번호 입력 (입력해도 화면에 표시 안 됨 — 정상)\nPassword: xxxxxxxx`} />

              <p className="text-slate-300 text-sm font-semibold mt-3 mb-2">② 로그인 성공 시 화면</p>
              <div className="my-2 rounded-xl overflow-hidden border border-slate-600">
                <div className="bg-slate-800 px-4 py-2 text-xs text-slate-400 font-mono">Proxmox Shell (root 로그인 후)</div>
                <pre className="bg-black p-4 text-sm font-mono text-green-400 leading-relaxed">{`Linux homelab 6.8.x-3-pve #1 SMP PREEMPT_DYNAMIC ...\n...\nLast login: ...\n\n  ██████╗ ██╗   ██╗███████╗\n  ██╔══██╗██║   ██║██╔════╝\n  ██████╔╝██║   ██║█████╗\n  ██╔═══╝ ╚██╗ ██╔╝██╔══╝\n  ██║      ╚████╔╝ ███████╗\n  ╚═╝       ╚═══╝  ╚══════╝\n\nroot@homelab:~# _`}</pre>
              </div>

              <p className="text-slate-300 text-sm font-semibold mt-3 mb-2">③ 네트워크·IP 확인</p>
              <CodeBlock label="Proxmox Shell" code={`# 현재 IP 확인 (vmbr0 브리지 IP)\nip addr show vmbr0\n\n# 예상 출력:\n# inet ${pxIP}/${pfx} brd ... scope global vmbr0\n\n# 게이트웨이 확인\nip route | grep default\n# 예: default via ${gw} dev vmbr0\n\n# 인터넷 연결 확인\nping -c 3 8.8.8.8`} />

              <p className="text-slate-300 text-sm font-semibold mt-3 mb-2">④ IP가 다를 경우 — 설정 파일 직접 수정하기</p>

              {/* 상황 설명 */}
              <div className="mb-4 p-3 bg-amber-900/20 rounded-xl border border-amber-500/30 text-sm text-amber-200">
                <p className="font-semibold mb-1">📌 이런 상황일 때 진행하세요</p>
                <p className="text-xs text-amber-300/80">설치 때 IP를 입력했는데 <code className="bg-black/30 px-1 rounded">ip addr show vmbr0</code> 결과가 다른 IP로 나오거나, 웹 UI({pxIP}:8006)에 접속이 안 될 때</p>
              </div>

              {/* nano 설명 */}
              <div className="mb-3 p-4 bg-slate-800 rounded-xl border border-slate-700">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">🖊 nano란?</p>
                <p className="text-xs text-slate-300">터미널(콘솔)에서 파일을 열고 수정하는 텍스트 편집기입니다. 마우스 없이 키보드만으로 사용합니다. 파일을 열면 화면에 내용이 표시되고, 방향키로 이동 · 직접 타이핑으로 수정합니다.</p>
              </div>

              {/* STEP 1: 파일 열기 */}
              <p className="text-white font-semibold text-sm mb-1">STEP 1 — 파일 열기</p>
              <p className="text-xs text-slate-400 mb-2">아래 명령어를 입력하면 <code className="bg-slate-700 px-1 rounded text-cyan-400">/etc/network/interfaces</code> 파일이 nano 편집기로 열립니다.</p>
              <CodeBlock label="Proxmox Shell" code={`nano /etc/network/interfaces`} />

              {/* STEP 2: 내용 확인 및 수정 */}
              <p className="text-white font-semibold text-sm mt-4 mb-1">STEP 2 — 내용 수정</p>
              <p className="text-xs text-slate-400 mb-2">파일이 열리면 <strong className="text-white">방향키(↑↓←→)</strong>로 커서를 이동해서 잘못된 IP 부분을 찾아 수정합니다. 아래 내용과 똑같이 맞춰주세요.</p>
              <CodeBlock label="/etc/network/interfaces — 이렇게 되어 있어야 합니다" code={`auto lo\niface lo inet loopback\n\niface ens18 inet manual\n\nauto vmbr0\niface vmbr0 inet static\n    address ${pxIP}/${pfx}\n    gateway ${gw}\n    nameserver ${dns}\n    bridge-ports ens18\n    bridge-stp off\n    bridge-fd 0`} />

              {/* STEP 3: 저장 */}
              <p className="text-white font-semibold text-sm mt-4 mb-2">STEP 3 — 저장하고 닫기</p>
              <div className="space-y-2 mb-3">
                {[
                  { key: 'Ctrl + X',  desc: '종료 시도 → "Save modified buffer?" 메시지 표시' },
                  { key: 'Y',         desc: '"Yes(저장)" 선택' },
                  { key: 'Enter',     desc: '파일 이름 확인 → 저장 완료 후 nano 종료' },
                ].map(({ key, desc }) => (
                  <div key={key} className="flex items-center gap-3">
                    <kbd className="px-2 py-1 bg-slate-700 border border-slate-500 rounded text-xs font-mono text-cyan-300 whitespace-nowrap flex-shrink-0">{key}</kbd>
                    <span className="text-sm text-slate-300">{desc}</span>
                  </div>
                ))}
              </div>

              {/* nano 화면 시뮬레이션 */}
              <div className="rounded-xl overflow-hidden border border-slate-600 mb-4">
                <div className="bg-slate-800 px-4 py-2 text-xs text-slate-400 font-mono">nano 화면 하단 — 단축키 안내</div>
                <div className="bg-black p-3 font-mono text-xs">
                  <div className="text-slate-300 mb-1">  GNU nano  /etc/network/interfaces</div>
                  <div className="text-slate-600 border-t border-slate-800 pt-2 grid grid-cols-2 gap-x-4 gap-y-0.5">
                    {[['^G', 'Help'], ['^X', 'Exit'], ['^O', 'Write Out'], ['^W', 'Where Is'], ['^K', 'Cut'], ['^U', 'Paste']].map(([k, v]) => (
                      <span key={k}><span className="text-white">{k}</span> {v}</span>
                    ))}
                  </div>
                  <p className="text-slate-600 text-xs mt-1">* ^ 는 Ctrl 키를 의미합니다</p>
                </div>
              </div>

              {/* STEP 4: 적용 */}
              <p className="text-white font-semibold text-sm mb-1">STEP 4 — 설정 적용</p>
              <p className="text-xs text-slate-400 mb-2">nano를 닫은 뒤 아래 명령으로 네트워크를 재시작해야 변경 내용이 반영됩니다.</p>
              <CodeBlock label="Proxmox Shell — 네트워크 재시작 및 IP 확인" code={`systemctl restart networking\n\n# 변경된 IP 확인 (${pxIP} 로 나오면 성공)\nip addr show vmbr0`} />

              <p className="text-slate-300 text-sm font-semibold mt-3 mb-2">⑤ 웹 관리 UI 접속 확인</p>
              <p className="text-xs text-slate-400 mb-1">IP가 확인되면 <strong>같은 네트워크의 다른 PC</strong> 브라우저에서 접속합니다.</p>
              <BrowserBar url={`https://${pxIP}:8006`} />
              <Note type="tip">"연결이 안전하지 않습니다" 경고 → '고급' → '<strong>{pxIP}으로 이동</strong>' 클릭. 자체 서명 인증서라 정상입니다. 사용자명 <code className="bg-slate-700 px-1 rounded text-cyan-400">root</code>, 비밀번호는 설치 시 설정값. "유효한 구독 없음" 팝업 → 확인 클릭 무시.</Note>
            </>
          ),
        },
        {
          title: '무료 업데이트 저장소 설정',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-2">Proxmox 웹 UI → 왼쪽 트리에서 <strong>homelab</strong> 클릭 → <strong>Shell</strong> 탭 → 아래 명령 실행</p>
              <CodeBlock label="Proxmox Shell" code={`# 유료 저장소 비활성화\nsed -i 's/^deb/# deb/' /etc/apt/sources.list.d/pve-enterprise.list\nsed -i 's/^deb/# deb/' /etc/apt/sources.list.d/ceph.list\n\n# 무료 저장소 추가\necho "deb http://download.proxmox.com/debian/pve bookworm pve-no-subscription" \\\n  >> /etc/apt/sources.list\n\n# 패키지 업데이트\napt update && apt upgrade -y`} />
              <Note type="tip">이 작업을 해야 이후 apt upgrade가 오류 없이 작동합니다. 최초 1회만 실행하면 됩니다.</Note>
            </>
          ),
        },
      ],
    },

    /* ══════════════════════════════════════ STEP 2 NAS */
    {
      id: 2, title: 'VM1 · NAS 서버', subtitle: 'Ubuntu + CasaOS + Jellyfin + Samba', icon: '🗄️', color: 'from-blue-500 to-cyan-500',
      sections: [
        {
          title: 'Proxmox 웹 UI 접속하기',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-3">
                Proxmox 설치가 완료된 PC와 <strong>같은 네트워크(공유기)</strong>에 연결된 다른 PC 또는 노트북의 브라우저에서 접속합니다.
              </p>

              {/* 접속 순서 */}
              <div className="space-y-3 mb-4">
                {[
                  { n: '1', title: '브라우저 주소창에 아래 주소 입력 후 Enter', sub: '크롬, 엣지 등 아무 브라우저나 가능' },
                  { n: '2', title: '"연결이 안전하지 않습니다" 경고 무시', sub: '자체 서명 인증서라 정상 — "고급" 클릭 후 이동' },
                  { n: '3', title: '로그인 화면에서 계정 입력', sub: 'Username: root  /  Password: 설치 시 설정한 값' },
                  { n: '4', title: '"유효한 구독 없음" 팝업 → 확인 클릭', sub: '무료 버전이라 뜨는 팝업 — 무시해도 됩니다' },
                ].map(({ n, title, sub }) => (
                  <div key={n} className="flex items-start gap-3 p-3 bg-slate-800 rounded-xl border border-slate-700">
                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">{n}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
                      {n === '1' && (
                        <BrowserBar url={`https://${pxIP}:8006`} className="mt-3" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 로그인 화면 시뮬레이션 */}
              <div className="mt-4 rounded-xl overflow-hidden border border-slate-600">
                <div className="bg-slate-800 px-4 py-2 text-xs text-slate-400 font-mono flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="ml-2">Proxmox Virtual Environment — 로그인 화면</span>
                </div>
                <div className="bg-slate-950 p-5">
                  <div className="max-w-xs mx-auto space-y-3">
                    <p className="text-center text-white font-bold text-sm mb-4">Proxmox Virtual Environment</p>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Username</p>
                      <div className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm font-mono text-cyan-400">root</div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Password</p>
                      <div className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm font-mono text-slate-400">••••••••</div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Realm</p>
                      <div className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-400">Linux PAM standard authentication</div>
                    </div>
                    <div className="bg-blue-600 rounded px-3 py-2 text-center text-sm text-white font-semibold">Login</div>
                  </div>
                </div>
              </div>

              {/* 로그인 후 화면 설명 */}
              <div className="mt-4 p-4 bg-slate-800/60 rounded-xl border border-slate-700">
                <p className="text-sm font-semibold text-white mb-3">로그인 후 웹 UI 구조</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { area: '왼쪽 트리', desc: 'Datacenter → homelab (호스트) → VM 목록', color: 'border-cyan-500/50 text-cyan-300' },
                    { area: '오른쪽 상단', desc: '\'VM 만들기\' 버튼 — 새 가상머신 생성 시작', color: 'border-emerald-500/50 text-emerald-300' },
                    { area: '중앙 패널', desc: '선택한 VM·호스트의 상세 설정·콘솔·모니터링', color: 'border-purple-500/50 text-purple-300' },
                  ].map(({ area, desc, color }) => (
                    <div key={area} className={`p-3 rounded-lg border bg-slate-900/50 ${color}`}>
                      <p className={`font-bold mb-1 ${color.split(' ')[1]}`}>{area}</p>
                      <p className="text-slate-400">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Note type="tip">접속이 안 된다면 — ① Proxmox PC가 켜져 있는지 확인 ② 같은 공유기(네트워크)에 연결됐는지 확인 ③ IP 주소가 맞는지 확인 (<code className="bg-slate-700 px-1 rounded text-cyan-400">ping {pxIP}</code> 명령으로 응답 확인)</Note>
            </>
          ),
        },
        {
          title: 'VM 생성 설정 (VM ID: 100)',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-3">Proxmox 웹 UI 오른쪽 상단 <strong>'VM 만들기'</strong> 버튼 클릭 → 아래 값으로 설정합니다.</p>
              <div className="grid grid-cols-2 gap-2 my-3">
                {[
                  ['VM ID', '100'], ['이름', 'nas-server'],
                  ['OS ISO', 'Ubuntu Server 24.04'], ['BIOS', 'SeaBIOS (기본값)'],
                  ['CPU 코어', '2'], ['RAM', '2048 MB (2 GB) → 업그레이드 후 4096 MB'],
                  ['디스크 크기', '60 GB (M.2 SSD)'], ['네트워크', 'VirtIO (기본값)'],
                ].map(([k, v], i) => (
                  <div key={i} className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="text-xs text-slate-500 mb-0.5">{k}</div>
                    <div className="text-sm font-mono text-cyan-400">{v}</div>
                  </div>
                ))}
              </div>
              <Note type="info">1TB HDD는 VM 디스크 대신 <strong>패스스루(Passthrough)</strong>로 직접 연결하는 것이 안정적입니다. 아래 단계에서 설명합니다.</Note>
            </>
          ),
        },
        {
          title: '1TB HDD 패스스루 연결',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-2">Proxmox Shell에서 HDD 장치명을 확인 후 VM에 직접 연결합니다.</p>
              <CodeBlock label="Proxmox Shell" code={`# 디스크 목록 확인 (sdb 또는 sdc가 1TB HDD)\nlsblk -o NAME,SIZE,MODEL\n\n# VM 100에 HDD 패스스루 추가 (예: /dev/sdb가 1TB HDD인 경우)\nqm set 100 --scsi1 /dev/sdb`} />
              <Note type="warn">패스스루 전 HDD에 기존 중요 데이터가 있다면 반드시 백업하세요.</Note>
            </>
          ),
        },
        {
          title: 'Ubuntu 설치 중 고정 IP 직접 설정',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-3">VM 100 시작 → Console 탭에서 Ubuntu 설치 진행. 설치 중 네트워크 설정 단계에서 <strong>처음부터 고정 IP로 입력</strong>합니다.</p>
              <div className="p-4 bg-slate-800 rounded-xl border border-cyan-500/40 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">🖥️</span>
                  <span className="text-sm font-bold text-cyan-300">Ubuntu 설치 마법사 — 네트워크 설정 단계</span>
                </div>
                <div className="space-y-2.5 mb-3">
                  {[
                    ['1', '설치 화면에서 Network connections 메뉴 진입'],
                    ['2', 'ens18 (또는 eth0) 선택 → Enter → Edit IPv4 선택'],
                    ['3', 'IPv4 Method: Automatic (DHCP) → Manual 로 변경'],
                    ['4', '아래 값 입력 후 Save'],
                    ['5', 'Done → 설치 계속 진행'],
                  ].map(([n, t]) => (
                    <div key={n} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">{n}</span>
                      <span className="text-sm text-slate-300">{t}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {[
                    ['Subnet',        `${nasIP}/${pfx}`],
                    ['Address',       nasIP],
                    ['Gateway',       gw],
                    ['Name servers',  dns],
                    ['Search domains','(비워두기)'],
                    ['OpenSSH Server','✅ 설치 체크 필수'],
                  ].map(([k, v]) => (
                    <div key={k} className={`p-2 rounded-lg border ${['Subnet','Address','Gateway','Name servers'].includes(k) ? 'bg-cyan-900/20 border-cyan-600/40' : 'bg-slate-700/50 border-slate-600'}`}>
                      <div className="text-xs text-slate-500 mb-0.5">{k}</div>
                      <div className="text-sm font-mono text-cyan-300">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* SSH 개념 설명 */}
              <div className="mt-4 mb-4 p-4 bg-slate-800 rounded-xl border border-slate-700">
                <p className="text-sm font-bold text-white mb-2">🔐 SSH란?</p>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  <strong className="text-cyan-300">SSH(Secure Shell)</strong>는 네트워크를 통해 다른 컴퓨터에 원격으로 접속해서 명령어를 실행할 수 있는 방법입니다.
                  쉽게 말하면 <strong className="text-white">NAS VM 앞에 모니터·키보드 없이도, 내 PC 터미널 창에서 NAS VM을 직접 조작</strong>할 수 있게 해줍니다.
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  {[
                    { label: '내 PC (터미널)', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
                    { label: '──SSH──▶', color: 'text-slate-500' },
                    { label: `NAS VM (${nasIP})`, color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
                  ].map((n, i) => n.label.includes('SSH')
                    ? <span key={i} className={n.color}>{n.label}</span>
                    : <span key={i} className={`px-2 py-1 rounded-lg border ${n.color}`}>{n.label}</span>
                  )}
                </div>
              </div>

              <p className="text-white font-semibold text-sm mb-3">설치 완료 후 — SSH 접속하기</p>
              <Note type="tip">고정 IP로 설치했으므로 VM이 부팅되면 즉시 SSH 접속이 가능합니다. netplan 수정 불필요!</Note>

              {/* 터미널 여는 방법 */}
              <p className="text-white font-semibold text-sm mt-4 mb-2">① 내 PC에서 터미널(명령 창) 열기</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {[
                  {
                    os: '🪟 Windows',
                    color: 'border-cyan-500/40 bg-cyan-900/10',
                    steps: [
                      '키보드에서 Windows 키 + R 누르기',
                      '"실행" 창에 powershell 입력 → Enter',
                      '또는 시작 메뉴 → "PowerShell" 검색 → 실행',
                    ],
                  },
                  {
                    os: '🍎 macOS',
                    color: 'border-purple-500/40 bg-purple-900/10',
                    steps: [
                      'Command(⌘) + Space → "터미널" 검색 → Enter',
                      '또는 Finder → 응용 프로그램 → 유틸리티 → 터미널',
                    ],
                  },
                ].map(({ os, color, steps }) => (
                  <div key={os} className={`p-3 rounded-xl border ${color}`}>
                    <p className="text-white font-semibold text-xs mb-2">{os}</p>
                    <ol className="space-y-1">
                      {steps.map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-slate-400">
                          <span className="text-slate-600 flex-shrink-0">{i + 1}.</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>

              {/* SSH 명령어 설명 */}
              <p className="text-white font-semibold text-sm mb-2">② SSH 접속 명령어 입력</p>
              <p className="text-xs text-slate-400 mb-2">터미널 창이 열리면 아래 명령어를 그대로 입력하고 Enter를 누릅니다.</p>
              <CodeBlock label="내 PC 터미널 (PowerShell / macOS 터미널)" code={`ssh ubuntu@${nasIP}`} />

              {/* 명령어 구조 설명 */}
              <div className="my-3 p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs font-mono">
                <p className="text-slate-500 mb-2 font-sans">명령어 구조 설명</p>
                <div className="flex flex-wrap gap-x-1 gap-y-2 items-start">
                  {[
                    { word: 'ssh',      color: 'text-amber-300',  desc: 'SSH 접속 명령어' },
                    { word: 'ubuntu',   color: 'text-cyan-300',   desc: 'NAS VM 로그인 계정명 (Ubuntu 설치 시 생성한 유저)' },
                    { word: '@',        color: 'text-slate-500',  desc: '' },
                    { word: nasIP,      color: 'text-emerald-300',desc: 'NAS VM의 IP 주소' },
                  ].map(({ word, color, desc }, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className={`font-bold ${color}`}>{word}</span>
                      {desc && <span className="text-slate-600 font-sans text-center leading-tight" style={{ fontSize: '10px', maxWidth: '90px' }}>{desc}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* 최초 접속 경고 */}
              <p className="text-white font-semibold text-sm mt-4 mb-2">③ 최초 접속 시 — 보안 경고 확인</p>
              <p className="text-xs text-slate-400 mb-2">처음 접속하면 아래 메시지가 뜹니다. <strong className="text-white">yes</strong> 를 입력하고 Enter를 누르세요. (이후엔 다시 묻지 않습니다)</p>
              <div className="rounded-xl overflow-hidden border border-slate-600 mb-3">
                <div className="bg-slate-800 px-4 py-2 text-xs text-slate-400 font-mono">터미널 — 최초 접속 경고</div>
                <pre className="bg-black p-4 text-xs font-mono text-yellow-300 leading-relaxed whitespace-pre-wrap">{`The authenticity of host '${nasIP}' can't be established.
ED25519 key fingerprint is SHA256:xxxxxxxxxxxxxxxxxxxx.
Are you sure you want to continue connecting (yes/no/[fingerprint])? `}<span className="text-white">yes</span></pre>
              </div>

              {/* 비밀번호 입력 */}
              <p className="text-white font-semibold text-sm mb-2">④ 비밀번호 입력</p>
              <div className="rounded-xl overflow-hidden border border-slate-600 mb-3">
                <div className="bg-slate-800 px-4 py-2 text-xs text-slate-400 font-mono">터미널 — 비밀번호 입력</div>
                <pre className="bg-black p-4 text-xs font-mono text-green-400 leading-relaxed">{`ubuntu@${nasIP}'s password: `}<span className="text-slate-600">← 입력해도 화면에 아무것도 안 보임 (정상!)</span></pre>
              </div>
              <Note type="info">비밀번호를 입력할 때 화면에 아무것도 표시되지 않습니다. 보안상 의도된 동작이니 당황하지 말고 비밀번호를 입력한 후 Enter를 누르세요.</Note>

              {/* 접속 성공 */}
              <p className="text-white font-semibold text-sm mt-4 mb-2">⑤ 접속 성공 화면</p>
              <div className="rounded-xl overflow-hidden border border-slate-600 mb-3">
                <div className="bg-slate-800 px-4 py-2 text-xs text-slate-400 font-mono">터미널 — SSH 접속 성공</div>
                <pre className="bg-black p-4 text-xs font-mono text-green-400 leading-relaxed">{`Welcome to Ubuntu 24.04 LTS (GNU/Linux 6.8.x-xx-generic x86_64)

Last login: ...
ubuntu@nas-server:~$ `}<span className="text-white">_</span></pre>
              </div>
              <p className="text-xs text-slate-400 mb-4">이 화면이 나오면 NAS VM에 성공적으로 접속된 것입니다. 이제 이 터미널 창에서 NAS VM에 명령어를 실행할 수 있습니다.</p>

              {/* VM 콘솔에서 IP 확인 */}
              <p className="text-white font-semibold text-sm mb-2">⑥ (SSH 전) VM 콘솔에서 IP 확인하는 방법</p>
              <p className="text-xs text-slate-400 mb-2">SSH가 안 된다면 Proxmox 웹 UI → VM 100 선택 → <strong className="text-white">Console</strong> 탭에서 직접 로그인 후 IP를 확인합니다.</p>
              <CodeBlock label="VM 콘솔 — IP 확인" code={`ip addr show ens18\n# 출력: inet ${nasIP}/${pfx} 확인\n\nping -c 2 ${gw}    # 게이트웨이 응답 확인`} />

              {/* 시스템 업데이트 */}
              <p className="text-white font-semibold text-sm mt-4 mb-2">⑦ 접속 후 — 시스템 업데이트</p>
              <p className="text-xs text-slate-400 mb-2">SSH 접속에 성공했다면 가장 먼저 시스템을 최신 상태로 업데이트합니다.</p>
              <CodeBlock label="NAS VM SSH" code={`sudo apt update && sudo apt upgrade -y`} />
            </>
          ),
        },
        {
          title: 'CasaOS 설치 (NAS 대시보드)',
          body: () => (
            <>
              <CodeBlock label="NAS VM SSH" code={`# CasaOS 원클릭 설치 (약 3~5분)\ncurl -fsSL https://get.casaos.io | sudo bash`} />
              <p className="text-slate-300 text-sm my-2">설치 완료 후 브라우저에서 접속:</p>
              <BrowserBar url={`http://${nasIP}`} />
              <Note type="tip">CasaOS는 시놀로지 NAS와 비슷한 예쁜 웹 대시보드를 무료로 제공합니다.</Note>
            </>
          ),
        },
        {
          title: 'Jellyfin 설치 (Google TV · 모바일 스트리밍)',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-2">영화·사진을 Google TV / 스마트폰에서 스트리밍하는 무료 미디어 서버입니다.</p>
              <CodeBlock label="NAS VM SSH" code={`# Jellyfin 공식 설치\ncurl https://repo.jellyfin.org/install-debuntu.sh | sudo bash\n\n# 서비스 자동 시작 설정\nsudo systemctl enable --now jellyfin`} />
              <p className="text-slate-300 text-sm my-2">설치 후 초기 설정 접속:</p>
              <BrowserBar url={`http://${nasIP}:8096`} />
              <div className="mt-3 p-4 bg-blue-900/30 rounded-xl border border-blue-500/40">
                <p className="text-sm font-semibold text-blue-300 mb-2">📺 Google TV 연결 방법</p>
                <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
                  <li>Google TV → 앱 스토어 → <strong>Jellyfin</strong> 검색 → 설치</li>
                  <li>서버 추가 → 주소 입력: <code className="text-cyan-400">http://{nasIP}:8096</code></li>
                  <li>계정 로그인 후 미디어 라이브러리에서 영화 재생</li>
                </ol>
              </div>
            </>
          ),
        },
        {
          title: 'Samba 설정 (Windows 파일 공유)',
          body: () => (
            <>
              <CodeBlock label="NAS VM SSH" code={`# 미디어 폴더 생성\nsudo mkdir -p /data/media /data/files\nsudo chmod 777 /data/media /data/files\n\n# smb.conf 편집 (맨 아래에 추가)\nsudo nano /etc/samba/smb.conf`} />
              <CodeBlock label="/etc/samba/smb.conf — 아래 내용 추가" code={`[media]\n  path = /data/media\n  browseable = yes\n  writable = yes\n  guest ok = yes\n\n[files]\n  path = /data/files\n  browseable = yes\n  writable = yes\n  guest ok = yes`} />
              <CodeBlock label="NAS VM SSH" code="sudo systemctl restart smbd nmbd" />
              <Note type="info">Windows VM에서 파일 탐색기 → 주소창에 <code className="bg-slate-700 px-1 rounded text-cyan-400">\\{nasIP}\media</code> 입력하면 바로 접근 가능합니다.</Note>
            </>
          ),
        },
        {
          title: 'NAS IP 고정 (공유기 DHCP 예약)',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-3">
                Ubuntu 설치 시 고정 IP를 입력했더라도, <strong>공유기에서도 MAC 주소로 IP를 예약</strong>해두면 재부팅·DHCP 충돌 걱정 없이 항상 같은 IP를 보장받을 수 있습니다.
              </p>

              {/* 방법 선택 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {[
                  { badge: '방법 A · 권장', color: 'border-cyan-500/50 bg-cyan-900/10', badgeColor: 'bg-cyan-500/20 text-cyan-300',
                    title: '공유기 DHCP 예약', desc: 'MAC 주소로 항상 같은 IP를 할당. netplan 수정 불필요. 공유기에서 한 번만 설정.' },
                  { badge: '방법 B · 이미 완료', color: 'border-slate-600 bg-slate-800/40', badgeColor: 'bg-slate-700 text-slate-400',
                    title: 'Ubuntu 설치 시 고정 IP', desc: '설치 마법사에서 Manual IP를 입력한 방법. 이미 완료했다면 방법 A까지 하면 이중으로 안전합니다.' },
                ].map((m, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${m.color}`}>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${m.badgeColor}`}>{m.badge}</span>
                    <p className="text-white font-semibold text-sm mt-2 mb-1">{m.title}</p>
                    <p className="text-xs text-slate-400">{m.desc}</p>
                  </div>
                ))}
              </div>

              {/* STEP A: MAC 주소 확인 */}
              <p className="text-white font-semibold text-sm mb-2">① NAS VM의 MAC 주소 확인</p>
              <p className="text-slate-400 text-xs mb-2">Proxmox 웹 UI → VM 100 선택 → <strong>Hardware</strong> 탭 → Network Device 항목에서 확인하거나, SSH로 확인합니다.</p>
              <CodeBlock label="NAS VM SSH" code={`ip link show ens18\n# 출력 예:\n# ens18: ...\n#     link/ether aa:bb:cc:dd:ee:ff brd ff:ff:ff:ff:ff:ff\n#                ↑ 이 값이 MAC 주소`} />

              {/* STEP B: 공유기 설정 */}
              <p className="text-white font-semibold text-sm mt-4 mb-2">② 공유기 관리 페이지에서 DHCP 예약 설정</p>
              <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 mb-3">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-3">공유기 종류별 접속 주소</p>
                <div className="space-y-2">
                  {[
                    { name: '대부분의 공유기 (ipTIME, 아수스, TP-Link)', addr: `http://${gw}` },
                    { name: 'KT 홈허브 / LG 유플러스 공유기',            addr: 'http://192.168.219.1' },
                    { name: 'SK 브로드밴드 공유기',                       addr: 'http://192.168.35.1' },
                  ].map((r, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <span className="text-xs text-slate-500 flex-1">{r.name}</span>
                      <code className="text-xs font-mono text-cyan-400 bg-slate-900 px-2 py-1 rounded">{r.addr}</code>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {[
                  ['1', '공유기 관리 페이지 접속 (위 주소 입력)'],
                  ['2', '고급 설정 → DHCP 서버 → 정적 IP 할당 (또는 "IP 예약") 메뉴'],
                  ['3', 'MAC 주소 입력: 위에서 확인한 NAS VM MAC 주소'],
                  ['4', `IP 주소 입력: ${nasIP}`],
                  ['5', '저장 → NAS VM 재부팅 후 IP 확인'],
                ].map(([n, t]) => (
                  <div key={n} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">{n}</span>
                    <span className="text-sm text-slate-300">{t}</span>
                  </div>
                ))}
              </div>

              {/* netplan 수동 설정 */}
              <p className="text-white font-semibold text-sm mb-2">③ (선택) Ubuntu에서 netplan으로 IP 재확인·수정</p>
              <Note type="info">설치 시 Manual IP로 입력했다면 아래는 건너뛰어도 됩니다. IP가 잘못 잡혔을 때만 수정합니다.</Note>
              <CodeBlock label="NAS VM SSH" code={`# 현재 IP 확인\nip addr show ens18\n\n# netplan 설정 파일 편집\nsudo nano /etc/netplan/00-installer-config.yaml`} />
              <CodeBlock label="/etc/netplan/00-installer-config.yaml" code={`network:\n  version: 2\n  ethernets:\n    ens18:\n      dhcp4: no\n      addresses:\n        - ${nasIP}/${pfx}\n      routes:\n        - to: default\n          via: ${gw}\n      nameservers:\n        addresses: [${dns}]`} />
              <CodeBlock label="NAS VM SSH — 설정 적용" code="sudo netplan apply" />
              <Note type="tip">netplan 파일명은 환경마다 다를 수 있습니다. <code className="bg-slate-700 px-1 rounded text-cyan-400">ls /etc/netplan/</code> 로 파일명을 확인하세요.</Note>
            </>
          ),
        },
        {
          title: '외부 접속 설정 — 방법 비교',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-4">집 밖에서 NAS 서버에 접속하는 방법은 크게 두 가지입니다. <strong className="text-emerald-400">Tailscale을 강력 추천</strong>합니다.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                {/* 방법 1 */}
                <div className="p-4 rounded-xl border-2 border-emerald-500/60 bg-emerald-900/10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white">방법 1 · 추천</span>
                  </div>
                  <p className="text-white font-bold text-sm mb-1">🔒 Tailscale VPN</p>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> 공유기 설정 불필요</li>
                    <li className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> 포트를 외부에 열지 않아 보안 우수</li>
                    <li className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> 외부 IP 변경돼도 자동 연결 유지</li>
                    <li className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> 설치 5분 · 무료 (100대 디바이스)</li>
                    <li className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> iOS·Android·Windows 앱 제공</li>
                  </ul>
                </div>
                {/* 방법 2 */}
                <div className="p-4 rounded-xl border border-slate-600 bg-slate-800/40">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-slate-600 text-slate-300">방법 2</span>
                  </div>
                  <p className="text-white font-bold text-sm mb-1">🌐 포트 포워딩</p>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li className="flex items-center gap-1.5"><span className="text-slate-500">–</span> 공유기에서 포트 직접 개방</li>
                    <li className="flex items-center gap-1.5"><span className="text-amber-400">!</span> 외부에 포트 노출 → 보안 주의 필요</li>
                    <li className="flex items-center gap-1.5"><span className="text-amber-400">!</span> 외부 IP 바뀌면 재설정 필요 (DDNS 별도)</li>
                    <li className="flex items-center gap-1.5"><span className="text-slate-500">–</span> Tailscale 미지원 기기용으로 사용</li>
                  </ul>
                </div>
              </div>
            </>
          ),
        },
        {
          title: '방법 1 · Tailscale VPN 설치 (추천)',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-4">
                Tailscale은 WireGuard 기반의 메시 VPN입니다. NAS와 내 스마트폰·PC를 같은 사설 네트워크로 묶어주므로,
                공유기 설정 없이 어디서든 NAS에 내부 IP처럼 접속할 수 있습니다.
              </p>

              {/* 동작 원리 */}
              <div className="mb-4 p-4 bg-slate-800/60 rounded-xl border border-emerald-500/30">
                <p className="text-xs font-semibold text-emerald-300 mb-2">📡 Tailscale 동작 원리</p>
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  {[
                    { label: '내 스마트폰', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
                    { label: '→', color: '' },
                    { label: 'Tailscale 네트워크', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
                    { label: '→', color: '' },
                    { label: `NAS (${nasIP})`, color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
                  ].map((n, i) => n.label === '→'
                    ? <span key={i} className="text-slate-600">{n.label}</span>
                    : <span key={i} className={`px-2 py-1 rounded-lg border ${n.color}`}>{n.label}</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-2">Tailscale이 부여하는 고정 IP(100.x.x.x)로 항상 접속 — 외부 IP·공유기 무관</p>
              </div>

              {/* STEP 1: NAS에 설치 */}
              <p className="text-white font-semibold text-sm mb-2">① NAS VM에 Tailscale 설치</p>
              <CodeBlock label="NAS VM SSH" code={`# Tailscale 공식 설치 스크립트\ncurl -fsSL https://tailscale.com/install.sh | sh\n\n# Tailscale 시작 및 로그인\nsudo tailscale up\n\n# 출력된 URL을 브라우저에서 열어 계정 연결\n# https://login.tailscale.com/a/xxxxxxxx`} />

              <Note type="info">Tailscale 계정이 없으면 <a href="https://tailscale.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">tailscale.com</a> 에서 무료 가입합니다. Google · GitHub · Microsoft 계정으로 바로 가입 가능합니다.</Note>

              {/* STEP 2: NAS IP 확인 */}
              <p className="text-white font-semibold text-sm mt-4 mb-2">② Tailscale IP 확인</p>
              <CodeBlock label="NAS VM SSH" code={`tailscale ip -4\n# 출력 예: 100.64.x.x  ← 이 IP로 외부에서 접속`} />

              {/* STEP 3: 클라이언트 설치 */}
              <p className="text-white font-semibold text-sm mt-4 mb-2">③ 접속할 기기에 Tailscale 앱 설치</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                {[
                  { os: '📱 Android / iOS', desc: 'Play Store / App Store에서 "Tailscale" 검색 설치 → 같은 계정으로 로그인', color: 'border-blue-500/40' },
                  { os: '💻 Windows / Mac', desc: 'tailscale.com/download 에서 다운로드 → 같은 계정 로그인', color: 'border-purple-500/40' },
                  { os: '📺 기타 기기',     desc: 'Tailscale 관리 콘솔(admin.tailscale.com)에서 연결된 기기 확인', color: 'border-slate-600' },
                ].map(({ os, desc, color }) => (
                  <div key={os} className={`p-3 rounded-xl border ${color} bg-slate-800/50`}>
                    <p className="text-white font-semibold text-xs mb-1">{os}</p>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </div>
                ))}
              </div>

              {/* STEP 4: 접속 테스트 */}
              <p className="text-white font-semibold text-sm mb-2">④ 외부에서 접속 테스트</p>
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 mb-3">
                <p className="text-xs text-slate-500 mb-2">Tailscale 연결 후 — 외부 어디서든 아래 주소로 접속</p>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center gap-3"><span className="text-slate-500 w-20">Jellyfin</span><span className="text-cyan-400">http://100.x.x.x:8096</span></div>
                  <div className="flex items-center gap-3"><span className="text-slate-500 w-20">CasaOS</span><span className="text-cyan-400">http://100.x.x.x</span></div>
                  <div className="flex items-center gap-3"><span className="text-slate-500 w-20">SSH</span><span className="text-cyan-400">ssh ubuntu@100.x.x.x</span></div>
                </div>
                <p className="text-xs text-slate-600 mt-2">* 100.x.x.x = ② 단계에서 확인한 Tailscale IP</p>
              </div>

              {/* Subnet Router 옵션 */}
              <p className="text-white font-semibold text-sm mb-2">⑤ (선택) Subnet Router — 내부 IP 그대로 접속</p>
              <p className="text-slate-400 text-xs mb-2">Tailscale IP 대신 기존 내부 IP({nasIP} 등)로 접속하고 싶다면 서브넷 라우터를 활성화합니다.</p>
              <CodeBlock label="NAS VM SSH" code={`# 서브넷 라우터 활성화 (예: 10.179.93.0/24 전체 공개)\nsudo tailscale up --advertise-routes=${netConfig.proxmoxIP.split('.').slice(0,3).join('.')}.0/${pfx} --accept-routes\n\n# Tailscale 관리 콘솔에서 Routes 승인 필요\n# admin.tailscale.com → 해당 기기 → Edit route settings → 승인`} />
              <Note type="tip">서브넷 라우터를 사용하면 Proxmox({pxIP}:8006), NAS({nasIP}), AI({aiIP}) 등 모든 내부 기기를 외부에서 내부 IP 그대로 접속 가능합니다.</Note>
            </>
          ),
        },
        {
          title: '방법 2 · 포트 포워딩 (Port Forwarding)',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-3">
                Tailscale을 사용하기 어렵거나, 특정 서비스를 불특정 다수에게 공개할 때 사용합니다.
              </p>

              <Note type="warn">포트 포워딩은 외부에서 내부 서버로 직접 접근을 허용합니다. 반드시 각 서비스에 <strong>로그인 비밀번호</strong>를 설정한 뒤 진행하세요.</Note>

              {/* 포트 목록 */}
              <div className="my-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-2 pr-3 text-slate-400 font-medium text-xs">서비스</th>
                      <th className="text-left py-2 pr-3 text-slate-400 font-medium text-xs">외부 포트</th>
                      <th className="text-left py-2 pr-3 text-slate-400 font-medium text-xs">내부 IP : 포트</th>
                      <th className="text-left py-2 text-slate-400 font-medium text-xs">프로토콜</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {[
                      { svc: '🎬 Jellyfin',  ext: '8096', int: `${nasIP}:8096`, proto: 'TCP', color: 'text-blue-300' },
                      { svc: '🏠 CasaOS',    ext: '80',   int: `${nasIP}:80`,   proto: 'TCP', color: 'text-cyan-300' },
                      { svc: '🔒 SSH (NAS)', ext: '2222', int: `${nasIP}:22`,   proto: 'TCP', color: 'text-emerald-300' },
                    ].map(({ svc, ext, int: intAddr, proto, color }) => (
                      <tr key={svc}>
                        <td className={`py-2.5 pr-3 font-medium ${color}`}>{svc}</td>
                        <td className="py-2.5 pr-3 font-mono text-amber-400 text-xs">{ext}</td>
                        <td className="py-2.5 pr-3 font-mono text-cyan-400 text-xs">{intAddr}</td>
                        <td className="py-2.5 text-slate-500 text-xs">{proto}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-500 mb-4">* SSH 외부 포트를 2222로 지정하는 이유: 22번 포트는 자동화 해킹 시도가 매우 많습니다.</p>

              <p className="text-white font-semibold text-sm mb-2">공유기 포트 포워딩 설정 방법</p>
              <div className="space-y-2 mb-4">
                {[
                  ['1', `공유기 관리 페이지 접속: http://${gw}`],
                  ['2', '고급 설정 → NAT/라우터 관리 → 포트 포워딩 (또는 "가상 서버") 메뉴'],
                  ['3', '규칙 추가 → 외부 포트 / 내부 IP:포트 / 프로토콜 입력'],
                  ['4', '위 표의 서비스별로 반복 추가 → 저장'],
                  ['5', '외부 IP 확인 후 테스트'],
                ].map(([n, t]) => (
                  <div key={n} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">{n}</span>
                    <span className="text-sm text-slate-300">{t}</span>
                  </div>
                ))}
              </div>

              <p className="text-white font-semibold text-sm mb-2">내 외부 IP 확인</p>
              <CodeBlock label="NAS VM SSH 또는 내 PC 터미널" code={`curl ifconfig.me\n# 또는 브라우저: https://ifconfig.me`} />

              <div className="mt-4 p-4 bg-slate-800/60 rounded-xl border border-slate-700">
                <p className="text-sm font-semibold text-white mb-2">외부에서 접속 테스트</p>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-20">Jellyfin</span><span className="text-cyan-400">http://[외부IP]:8096</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-20">CasaOS</span><span className="text-cyan-400">http://[외부IP]:80</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-20">SSH</span><span className="text-cyan-400">ssh -p 2222 ubuntu@[외부IP]</span></div>
                </div>
              </div>

              <Note type="tip">외부 IP가 자주 바뀐다면 <strong>DDNS</strong> 서비스(무료: DuckDNS, No-IP)를 함께 사용하면 고정 도메인으로 접속할 수 있습니다.</Note>
            </>
          ),
        },
      ],
    },

    /* ══════════════════════════════════════ STEP 3 AI */
    {
      id: 3, title: 'VM2 · AI 에이전트', subtitle: 'Ollama + Dify + PostgreSQL + PGVector', icon: '🤖', color: 'from-purple-600 to-violet-700',
      sections: [
        {
          title: 'VM 생성 설정 (VM ID: 101)',
          body: () => (
            <>
              <div className="grid grid-cols-2 gap-2 my-3">
                {[
                  ['VM ID', '101'], ['이름', 'ai-agent'],
                  ['OS ISO', 'Ubuntu Server 24.04'], ['CPU 코어', '4 (업그레이드 후 8)'],
                  ['RAM', '4096 MB (4 GB) → 업그레이드 후 20480 MB'], ['디스크 크기', '350 GB (M.2 SSD)'],
                  ['네트워크', 'VirtIO'], ['예상 IP', aiIP],
                ].map(([k, v], i) => (
                  <div key={i} className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="text-xs text-slate-500 mb-0.5">{k}</div>
                    <div className="text-sm font-mono text-purple-400">{v}</div>
                  </div>
                ))}
              </div>
              <Note type="info">Gemma2 9B 모델은 약 6~8GB RAM을 사용합니다. 20GB를 배분하면 Ollama + Dify + PostgreSQL 동시 구동이 충분합니다.</Note>
            </>
          ),
        },
        {
          title: 'Ubuntu 설치 중 고정 IP 직접 설정',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-3">VM 101 시작 → Console 탭에서 Ubuntu 설치. NAS와 동일하게 설치 마법사 네트워크 단계에서 <strong>처음부터 고정 IP로 입력</strong>합니다.</p>
              <div className="p-4 bg-slate-800 rounded-xl border border-purple-500/40 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">🖥️</span>
                  <span className="text-sm font-bold text-purple-300">Ubuntu 설치 마법사 — 네트워크 설정 단계</span>
                </div>
                <div className="space-y-2.5 mb-3">
                  {[
                    ['1', 'Network connections → ens18 선택 → Edit IPv4'],
                    ['2', 'IPv4 Method: Automatic (DHCP) → Manual 변경'],
                    ['3', '아래 값 입력 후 Save → Done'],
                  ].map(([n, t]) => (
                    <div key={n} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">{n}</span>
                      <span className="text-sm text-slate-300">{t}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['Subnet',        `${aiIP}/${pfx}`],
                    ['Address',       aiIP],
                    ['Gateway',       gw],
                    ['Name servers',  dns],
                    ['Search domains','(비워두기)'],
                    ['OpenSSH Server','✅ 설치 체크 필수'],
                  ].map(([k, v]) => (
                    <div key={k} className={`p-2 rounded-lg border ${['Subnet','Address','Gateway','Name servers'].includes(k) ? 'bg-purple-900/20 border-purple-600/40' : 'bg-slate-700/50 border-slate-600'}`}>
                      <div className="text-xs text-slate-500 mb-0.5">{k}</div>
                      <div className="text-sm font-mono text-purple-300">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <Note type="tip">설치 완료 후 VM이 부팅되면 즉시 SSH 접속 가능합니다.</Note>
              <CodeBlock label="내 PC 터미널" code={`ssh ubuntu@${aiIP}\n\nsudo apt update && sudo apt upgrade -y`} />
            </>
          ),
        },
        {
          title: 'Docker 설치',
          body: () => (
            <>
              <CodeBlock label="AI VM SSH" code={`# Docker 공식 설치 스크립트\ncurl -fsSL https://get.docker.com | sudo bash\n\n# 현재 유저를 docker 그룹에 추가\nsudo usermod -aG docker $USER\nnewgrp docker\n\n# 설치 확인\ndocker --version && docker compose version`} />
            </>
          ),
        },
        {
          title: 'Ollama 설치 (로컬 LLM 엔진)',
          body: () => (
            <>
              <CodeBlock label="AI VM SSH" code={`# Ollama 설치\ncurl -fsSL https://ollama.com/install.sh | sh\n\n# 외부 접근 허용 설정\nsudo systemctl edit ollama --force`} />
              <p className="text-slate-300 text-sm my-2">편집기가 열리면 아래 내용 입력 → Ctrl+X → Y → Enter 저장:</p>
              <CodeBlock label="systemd override 파일" code={`[Service]\nEnvironment="OLLAMA_HOST=0.0.0.0"`} />
              <CodeBlock label="AI VM SSH" code={`sudo systemctl daemon-reload && sudo systemctl restart ollama\n\n# Gemma2:2B 경량 모델 다운로드 (약 1.7GB, 8GB RAM에서 동작)\nollama pull gemma2:2b\n\n# 설치 확인\nollama list`} />
              <Note type="tip">모델은 처음 한 번만 다운로드하면 이후 로컬에서 무제한 무료 사용!</Note>
            </>
          ),
        },
        {
          title: 'Dify 설치 (AI 에이전트 빌더)',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-2">마우스 클릭으로 AI 워크플로우·에이전트·RAG를 만드는 오픈소스 플랫폼입니다.</p>
              <CodeBlock label="AI VM SSH" code={`cd ~\ngit clone https://github.com/langgenius/dify.git\ncd dify/docker\ncp .env.example .env\ndocker compose up -d\ndocker compose ps`} />
              <p className="text-slate-300 text-sm my-2">완료 후 브라우저에서 접속:</p>
              <BrowserBar url={`http://${aiIP}`} />
              <Note type="tip">최초 접속 시 관리자 계정을 만들면 됩니다.</Note>
            </>
          ),
        },
        {
          title: 'Gemma2 + Claude Code API 하이브리드 구성',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-3">Dify 웹 UI → 우측 상단 프로필 → <strong>설정 → 모델 공급자</strong>에서 두 모델을 모두 등록합니다.</p>
              <div className="space-y-3 mb-4">
                <div className="p-4 bg-purple-900/30 rounded-xl border border-purple-500/40">
                  <div className="font-semibold text-purple-300 mb-2">🟣 Gemma2:2b — 무료 로컬 (8GB) / Gemma2 9B (32GB 후)</div>
                  <p className="text-sm text-slate-400 mb-1">모델 공급자 → <strong>Ollama</strong> 추가</p>
                  <CodeBlock label="Ollama 서버 주소" code={`http://${aiIP}:11434`} />
                  <p className="text-xs text-slate-500">모델명: <code className="text-purple-300 bg-slate-800 px-1 rounded">gemma2:2b</code> (현재) → 32GB 업그레이드 후 <code className="text-purple-300 bg-slate-800 px-1 rounded">gemma2</code></p>
                </div>
                <div className="p-4 bg-cyan-900/30 rounded-xl border border-cyan-500/40">
                  <div className="font-semibold text-cyan-300 mb-2">🔵 Claude Code API — 코딩·복잡 작업용 (소량 과금)</div>
                  <p className="text-sm text-slate-400 mb-1">모델 공급자 → <strong>Anthropic</strong> → API Key 입력</p>
                  <CodeBlock label="Claude API 키 발급 주소" code="https://console.anthropic.com/settings/keys" />
                </div>
              </div>
              <p className="text-white font-semibold text-sm mb-2">⚡ 하이브리드 라우팅 전략</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {[
                  { icon: '🟣', title: 'Gemma2 (로컬·무료)',  badge: 'bg-purple-500/20 text-purple-300', tasks: ['일상 대화·한국어 Q&A', '단순 요약·번역', '파일 분류·태깅', '반복 자동화 작업'] },
                  { icon: '🔵', title: 'Claude Code (API)',  badge: 'bg-cyan-500/20 text-cyan-300',    tasks: ['코드 생성·디버깅', '복잡한 로직 분석', '긴 문서·논문 처리', '정밀 답변이 필요한 작업'] },
                ].map((m, i) => (
                  <div key={i} className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                    <div className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full mb-3 ${m.badge}`}>{m.icon} {m.title}</div>
                    <ul className="text-xs text-slate-400 space-y-1">
                      {m.tasks.map((t, j) => <li key={j} className="flex items-center gap-1.5"><span className="text-slate-600">•</span>{t}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
              <Note type="tip">가장 빠른 방법: 에이전트 앱 2개를 별도로 만드세요. ①일반용 에이전트(Gemma2) ②코딩용 에이전트(Claude Code)</Note>
              <Note type="info">Claude API는 사용한 토큰 수만큼만 과금됩니다. 코딩 작업 위주라면 월 $5~10 수준으로 충분히 사용 가능합니다.</Note>
            </>
          ),
        },
      ],
    },

    /* ══════════════════════════════════════ STEP 4 Windows */
    {
      id: 4, title: 'VM3 · Windows 11', subtitle: '개발 & 인터넷 작업용', icon: '💻', color: 'from-cyan-600 to-blue-600',
      sections: [
        {
          title: 'VM 생성 설정 (VM ID: 102)',
          body: () => (
            <>
              <div className="grid grid-cols-2 gap-2 my-3">
                {[
                  ['VM ID', '102'], ['이름', 'windows-work'],
                  ['OS ISO', 'Windows 11 Pro ISO'], ['Machine 타입', 'q35'],
                  ['BIOS', 'OVMF (UEFI) — 필수!'], ['TPM', 'TPM State 추가 → v2.0'],
                  ['CPU 코어', '2 (업그레이드 후 6)'], ['RAM', '2048 MB (2 GB) → 업그레이드 후 8192 MB'],
                  ['디스크 크기', '100 GB (M.2 SSD)'], ['예상 IP', winIP],
                ].map(([k, v], i) => (
                  <div key={i} className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="text-xs text-slate-500 mb-0.5">{k}</div>
                    <div className="text-sm font-mono text-cyan-400">{v}</div>
                  </div>
                ))}
              </div>
              <Note type="warn">Windows 11은 TPM 2.0이 필수입니다. Proxmox VM 생성 마법사 → '추가 탭'에서 TPM State 추가를 체크하세요.</Note>
            </>
          ),
        },
        {
          title: 'VirtIO 드라이버 추가 (성능 필수)',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-2">VirtIO 드라이버 없이는 Windows에서 디스크/네트워크가 느리거나 안 잡힙니다.</p>
              <CodeBlock label="Proxmox Shell" code={`wget -O /var/lib/vz/template/iso/virtio-win.iso \\\n  https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/stable-virtio/virtio-win.iso`} />
              <p className="text-slate-300 text-sm mt-2">VM 설정 → Hardware → CD/DVD Drive 추가 → virtio-win.iso 선택. Windows 설치 중 '드라이버 로드' 클릭 시 이 드라이브의 <code className="bg-slate-700 px-1 rounded text-cyan-400">amd64\w11</code> 폴더 선택.</p>
            </>
          ),
        },
        {
          title: '정품 인증 없이 사용 가능한 기능',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-3">정품 인증 없이도 개발·인터넷 목적은 100% 정상 작동합니다:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                {[
                  { label: '크롬 / 엣지 브라우저',    ok: true  },
                  { label: 'Cursor IDE (개발 도구)',   ok: true  },
                  { label: 'HTS 주식 프로그램',       ok: true  },
                  { label: '원격 데스크탑 (RDP)',      ok: true  },
                  { label: '바탕화면 테마/색상 변경',  ok: false },
                  { label: '배경화면 워터마크 제거',   ok: false },
                ].map((f, i) => (
                  <div key={i} className={`flex items-center gap-2 p-2.5 rounded-lg text-sm border ${f.ok ? 'bg-emerald-900/20 border-emerald-600/30 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                    <span>{f.ok ? '✓' : '✗'}</span>
                    <span>{f.label}</span>
                  </div>
                ))}
              </div>
            </>
          ),
        },
        {
          title: '원격 데스크탑 (RDP) 설정',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-2">Windows 설정 → 시스템 → 원격 데스크탑 → 켜기 활성화</p>
              <CodeBlock label="다른 PC / 스마트폰에서 RDP 접속" code={`컴퓨터: ${winIP}\n사용자명: (Windows 로그인 계정)\n포트: 3389 (기본값)`} />
              <Note type="tip">Android / iOS에서는 'Microsoft 원격 데스크탑' 앱으로 접속 가능합니다.</Note>
            </>
          ),
        },
      ],
    },

    /* ══════════════════════════════════════ STEP 5 야간 절전 */
    {
      id: 5, title: '야간 절전 모드', subtitle: '23:00 자동 종료 → 08:00 자동 부팅', icon: '🌙', color: 'from-indigo-600 to-slate-700',
      sections: [
        {
          title: '야간 절전 스케줄 개요',
          body: () => (
            <>
              <NightModeTimeline />
              <p className="text-slate-300 text-sm">Proxmox 호스트에 크론(cron) 작업을 등록합니다. 매일 밤 23시에 모든 VM을 안전하게 종료한 뒤, 하드웨어 RTC 알람으로 다음 날 오전 8시에 자동 부팅합니다.</p>
            </>
          ),
        },
        {
          title: '바이오스(BIOS) RTC 알람 설정',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-2">PC가 완전히 꺼진 상태에서도 자동으로 켜지려면 바이오스 설정이 먼저 필요합니다.</p>
              <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 text-sm text-slate-300 space-y-2">
                <p>1. PC 재부팅 시 <strong>Del</strong> 또는 <strong>F2</strong> 키를 눌러 바이오스 진입</p>
                <p>2. <strong>Power Management</strong> (또는 APM Configuration) 항목으로 이동</p>
                <p>3. <strong>RTC Alarm</strong> 또는 <strong>Resume by RTC Alarm</strong> → <strong>Enabled</strong></p>
                <p>4. 저장(F10) 후 재부팅</p>
              </div>
              <Note type="info">바이오스 메뉴 이름은 제조사마다 다를 수 있습니다. 'Wake on RTC' 또는 'Scheduled Power On' 등으로 표시됩니다.</Note>
            </>
          ),
        },
        {
          title: '야간 종료 스크립트 생성',
          body: () => (
            <>
              <CodeBlock label="Proxmox Shell" code={`cat > /usr/local/bin/night-mode.sh << 'EOF'\n#!/bin/bash\nLOG="/var/log/night-mode.log"\necho "$(date): 야간 절전 모드 시작" >> $LOG\n\n# 모든 VM 순차 종료 (100=NAS, 101=AI, 102=Windows)\nfor VMID in 102 101 100; do\n  STATUS=$(qm status $VMID 2>/dev/null | awk '{print $2}')\n  if [ "$STATUS" = "running" ]; then\n    echo "$(date): VM $VMID 종료 중..." >> $LOG\n    qm shutdown $VMID --timeout 90\n  fi\ndone\n\n# 종료 대기 (최대 2분)\nsleep 120\necho "$(date): 모든 VM 종료 완료. 다음 기동: 08:00" >> $LOG\n\n# 다음 날 08:00에 자동 부팅 후 전원 OFF\n/usr/sbin/rtcwake -m off -t $(date --date "tomorrow 08:00" +%s)\nEOF\n\nchmod +x /usr/local/bin/night-mode.sh`} />
            </>
          ),
        },
        {
          title: '크론(Cron) 자동 실행 등록',
          body: () => (
            <>
              <CodeBlock label="Proxmox Shell" code="crontab -e" />
              <p className="text-slate-300 text-sm my-2">편집기가 열리면 맨 아래에 추가하고 저장 (Ctrl+X → Y → Enter):</p>
              <CodeBlock label="crontab — 추가할 내용" code={`# 매일 밤 23:00에 야간 절전 모드 실행\n0 23 * * * /usr/local/bin/night-mode.sh`} />
              <CodeBlock label="등록 확인" code="crontab -l" />
              <Note type="tip">cron 표현식: <code className="bg-slate-700 px-1 rounded text-cyan-400">0 23 * * *</code> = 매일 23시 0분 실행.</Note>
            </>
          ),
        },
        {
          title: '수동 제어 명령어',
          body: () => (
            <>
              <CodeBlock label="Proxmox Shell — 즉시 야간 모드 테스트" code="/usr/local/bin/night-mode.sh" />
              <CodeBlock label="Proxmox Shell — 아침에 모든 VM 순서대로 시작" code={`qm start 100\nsleep 30 && qm start 101\nsleep 30 && qm start 102\n\n# 상태 확인\nqm list`} />
              <CodeBlock label="야간 절전 로그 확인" code="tail -20 /var/log/night-mode.log" />
              <Note type="info">VM은 NAS(100) → AI(101) → Windows(102) 순으로 시작하는 것이 좋습니다.</Note>
            </>
          ),
        },
      ],
    },

    /* ══════════════════════════════════════ STEP 6 RAM 업그레이드 */
    {
      id: 6, title: 'RAM 업그레이드', subtitle: '32GB 장착 후 VM 설정 변경', icon: '⬆️', color: 'from-emerald-500 to-teal-600',
      sections: [
        {
          title: '준비 사항',
          body: () => (
            <>
              <Checklist items={[
                'PC 완전 종료 (Proxmox 웹 UI → 모든 VM 종료 → 호스트 Shutdown)',
                '전원 케이블 분리 후 케이스 오픈',
                '기존 8GB DDR4 3200 모듈 제거',
                '32GB DDR4 3200 모듈 2개(16GB×2) 또는 1개(32GB) 장착',
                '케이스 조립 후 전원 켜기',
                'Proxmox 부팅 확인 — 웹 UI에서 RAM 32GB 인식 확인',
              ]} />
              <Note type="tip">Proxmox 웹 UI → 왼쪽 트리에서 homelab 클릭 → Summary 탭 → Memory 항목에서 32GB 인식 여부 확인.</Note>
            </>
          ),
        },
        {
          title: '각 VM RAM · CPU 증설 (Proxmox 명령어)',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-2">VM을 종료한 상태에서 Proxmox Shell에서 아래 명령을 실행합니다.</p>
              <CodeBlock label="Proxmox Shell" code={`# ── VM1 NAS: 2GB → 4GB (코어 유지) ──\nqm set 100 --memory 4096\n\n# ── VM2 AI 에이전트: 4GB → 20GB, 4코어 → 8코어 ──\nqm set 101 --memory 20480 --cores 8\n\n# ── VM3 Windows: 2GB → 8GB, 2코어 → 6코어 ──\nqm set 102 --memory 8192 --cores 6\n\n# 설정 확인\necho "=== VM100 ===" && qm config 100 | grep -E "memory|cores"\necho "=== VM101 ===" && qm config 101 | grep -E "memory|cores"\necho "=== VM102 ===" && qm config 102 | grep -E "memory|cores"`} />
              <Note type="info">VM이 실행 중일 때도 일부 설정이 적용되지만, 재부팅 후 완전히 반영됩니다.</Note>
              <CodeBlock label="Proxmox Shell — VM 순서대로 재시작" code={`qm start 100 && sleep 15\nqm start 101 && sleep 15\nqm start 102`} />
            </>
          ),
        },
        {
          title: 'AI 모델 업그레이드 (gemma2:2b → gemma2 9B)',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-2">RAM이 20GB로 늘어났으니 풀 사이즈 Gemma2 9B 모델로 교체합니다.</p>
              <CodeBlock label="AI VM SSH" code={`# gemma2 9B 풀 모델 다운로드 (약 5.5GB)\nollama pull gemma2\n\n# 기존 경량 모델 삭제 (선택 사항)\n# ollama rm gemma2:2b\n\n# 모델 목록 확인\nollama list`} />
              <div className="my-3 p-4 bg-purple-900/30 rounded-xl border border-purple-500/40">
                <p className="text-sm font-semibold text-purple-300 mb-2">🤖 Dify에서 모델 변경</p>
                <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
                  <li>Dify 웹 UI → 기존 에이전트 선택 → 편집</li>
                  <li>모델 드롭다운 → <strong className="text-white">gemma2</strong> (9B) 선택</li>
                  <li>저장 → 성능 향상 즉시 체감!</li>
                </ol>
              </div>
              <Note type="tip">업그레이드 전후 응답 품질 차이가 확연합니다.</Note>
            </>
          ),
        },
        {
          title: '업그레이드 후 최종 자원 배분 확인',
          body: () => (
            <div className="grid grid-cols-2 gap-2">
              {[
                ['VM1 NAS — CPU',      '2 vCPU (유지)'],
                ['VM1 NAS — RAM',      '2 GB → 4 GB ✓'],
                ['VM2 AI — CPU',       '4 vCPU → 8 vCPU ✓'],
                ['VM2 AI — RAM',       '4 GB → 20 GB ✓'],
                ['VM3 Windows — CPU',  '2 vCPU → 6 vCPU ✓'],
                ['VM3 Windows — RAM',  '2 GB → 8 GB ✓'],
                ['AI 모델',            'gemma2:2b → gemma2 9B ✓'],
                ['Windows 동시 구동', '권장 안함 → 상시 가능 ✓'],
              ].map(([k, v], i) => (
                <div key={i} className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="text-xs text-slate-500 mb-0.5">{k}</div>
                  <div className={`text-sm font-mono ${v.includes('✓') ? 'text-emerald-400' : 'text-white'}`}>{v}</div>
                </div>
              ))}
            </div>
          ),
        },
      ],
    },
  ];

  const step = STEPS[activeStep];

  /* ──────────────────────────────────────────
     JSX 렌더
  ────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-950 text-white" style={{ fontFamily: "'Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" }}>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden border-b border-slate-800" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0a0f1e 100%)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 55%), radial-gradient(ellipse at 80% 30%, rgba(6,182,212,0.10) 0%, transparent 55%)' }} />
        <div className="max-w-5xl mx-auto px-4 py-10 relative">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs font-bold px-3 py-1 bg-cyan-500/15 text-cyan-400 rounded-full border border-cyan-500/30">100% 무료 오픈소스</span>
            <span className="text-xs font-bold px-3 py-1 bg-purple-500/15 text-purple-400 rounded-full border border-purple-500/30">초보자 완전 따라하기</span>
            <span className="text-xs font-bold px-3 py-1 bg-amber-500/15 text-amber-400 rounded-full border border-amber-500/30">Ryzen 5825U 최적화</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-3 leading-tight" style={{ background: 'linear-gradient(90deg, #fff 0%, #a5f3fc 50%, #c4b5fd 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🏠 홈랩 완전 정복 가이드
          </h1>
          <p className="text-slate-400 text-sm md:text-base mb-6 max-w-2xl leading-relaxed">
            Proxmox VE로 PC 한 대를 NAS · AI 에이전트 · 개발 서버 3개로 분리하는 단계별 설치 가이드입니다.<br />
            <span className="text-slate-300 font-medium">Ryzen 5825U · DDR4 32GB · 512GB M.2 + 1TB HDD</span> 기준 자원 배분 포함.
          </p>

          {/* ── 🔧 네트워크 설정 패널 ── */}
          <div className="p-4 bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-cyan-500/40 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🔧</span>
              <span className="font-bold text-white text-sm">내 네트워크 설정</span>
              <span className="text-xs text-slate-500 hidden sm:inline">— 값을 수정하면 전체 가이드에 자동 반영됩니다</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Proxmox 관리 IP</label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={netConfig.proxmoxIP}
                    onChange={e => setNetConfig(prev => ({ ...prev, proxmoxIP: e.target.value }))}
                    className="flex-1 min-w-0 bg-slate-900 text-cyan-400 font-mono text-sm px-3 py-2 rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none"
                    placeholder="10.179.93.200"
                  />
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-600 rounded-lg px-2">
                    <span className="text-slate-500 text-sm">/</span>
                    <input
                      type="text"
                      value={netConfig.prefix}
                      onChange={e => setNetConfig(prev => ({ ...prev, prefix: e.target.value }))}
                      className="w-8 bg-transparent text-cyan-400 font-mono text-sm focus:outline-none text-center"
                      placeholder="24"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">게이트웨이 (Gateway)</label>
                <input
                  type="text"
                  value={netConfig.gateway}
                  onChange={e => setNetConfig(prev => ({ ...prev, gateway: e.target.value }))}
                  className="w-full bg-slate-900 text-cyan-400 font-mono text-sm px-3 py-2 rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none"
                  placeholder="10.179.93.62"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">DNS 서버</label>
                <input
                  type="text"
                  value={netConfig.dns}
                  onChange={e => setNetConfig(prev => ({ ...prev, dns: e.target.value }))}
                  className="w-full bg-slate-900 text-cyan-400 font-mono text-sm px-3 py-2 rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none"
                  placeholder="10.179.93.62"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: '⚙️ Proxmox',       ip: pxIP,  port: ':8006' },
                { label: '🗄️ NAS (VM1)',     ip: nasIP, port: ''      },
                { label: '🤖 AI (VM2)',       ip: aiIP,  port: ''      },
                { label: '💻 Windows (VM3)', ip: winIP, port: ''      },
              ].map(({ label, ip, port }) => (
                <div key={label} className="px-3 py-2 bg-slate-900/80 rounded-xl border border-slate-700">
                  <div className="text-xs text-slate-500 mb-0.5">{label}</div>
                  <div className="text-xs font-mono text-cyan-400 truncate">{ip}{port}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-600 mt-2">* NAS·AI·Windows IP는 Proxmox IP의 마지막 옥텟에 +1, +2, +3으로 자동 계산됩니다.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: '🗄️', label: 'NAS 서버',   desc: '영화·사진 스트리밍' },
              { icon: '🤖', label: 'AI 에이전트', desc: 'Gemma2 + Claude' },
              { icon: '💻', label: 'Windows 11', desc: '개발 & 인터넷' },
              { icon: '🌙', label: '야간 절전',   desc: '23시 꺼짐·8시 켜짐' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm">
                <span className="text-xl flex-shrink-0">{f.icon}</span>
                <div>
                  <div className="font-semibold text-white text-xs">{f.label}</div>
                  <div className="text-slate-500 text-xs">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* ── Resource Allocation ── */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-bold text-white">📊 자원 배분 계획</h2>
              <p className="text-slate-500 text-sm mt-1">
                {ramPhase === 'now' ? '🔧 현재 · DDR4 8GB 기준' : '⬆ 32GB 업그레이드 후 최적 배분'}
              </p>
            </div>
            <div className="flex gap-1 p-1 bg-slate-800 rounded-xl border border-slate-700 flex-shrink-0">
              <button onClick={() => setRamPhase('now')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${ramPhase === 'now' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                🔧 현재 · 8GB
              </button>
              <button onClick={() => setRamPhase('after')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${ramPhase === 'after' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                ⬆ 업그레이드 후 · 32GB
              </button>
            </div>
          </div>
          {ramPhase === 'now' && (
            <div className="my-3 p-3 bg-amber-900/20 rounded-xl border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2">
              <span className="text-base flex-shrink-0">⚠️</span>
              <span>8GB에서는 <strong>VM3 Windows를 동시 구동하지 않는 것</strong>을 권장합니다. 사용할 때만 켜고 평소엔 종료 상태로 유지하세요.</span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-3">
            <div className="md:col-span-2 bg-slate-900 rounded-2xl p-5 border border-slate-700">
              <p className="text-xs text-slate-500 font-semibold uppercase mb-4">전체 사용량</p>
              <ResourceBar label="CPU (vCPU)" used={ramPhase === 'now' ? 8 : 16} total={16} unit="" color="bg-gradient-to-r from-cyan-500 to-blue-500" />
              <ResourceBar label="RAM" used={ramPhase === 'now' ? 8 : 32} total={32} unit=" GB" color="bg-gradient-to-r from-purple-500 to-violet-500" />
              <ResourceBar label="M.2 SSD" used={512} total={512} unit=" GB" color="bg-gradient-to-r from-amber-500 to-orange-500" />
              <ResourceBar label="HDD" used={1000} total={1000} unit=" GB" color="bg-gradient-to-r from-emerald-500 to-green-500" />
            </div>
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(ramPhase === 'now' ? [
                { name: 'VM1 · NAS 서버',   icon: '🗄️', color: 'border-blue-500/60',   badge: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',     cpu: '2 vCPU', ram: '2 GB',  disk: '60GB M.2 + 1TB HDD', sw: 'Ubuntu + CasaOS + Jellyfin'    },
                { name: 'VM2 · AI 에이전트', icon: '🤖', color: 'border-purple-500/60', badge: 'bg-purple-500/15 text-purple-300 border border-purple-500/30', cpu: '4 vCPU', ram: '4 GB',  disk: '350GB M.2',          sw: 'Ollama(gemma2:2b) + Dify'       },
                { name: 'VM3 · Windows 11', icon: '💻', color: 'border-slate-500/60',   badge: 'bg-slate-600/40 text-slate-400 border border-slate-500/30',   cpu: '2 vCPU', ram: '2 GB',  disk: '100GB M.2',          sw: '⚠ 사용 시에만 켜기 권장'         },
                { name: 'Proxmox 호스트',   icon: '⚙️', color: 'border-slate-600',      badge: 'bg-slate-700/40 text-slate-400 border border-slate-600',      cpu: '공유',   ram: '~512 MB', disk: '2GB M.2 (시스템)', sw: 'Proxmox VE 8.x 하이퍼바이저'   },
              ] : [
                { name: 'VM1 · NAS 서버',   icon: '🗄️', color: 'border-blue-500/60',   badge: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',     cpu: '2 vCPU', ram: '4 GB',  disk: '60GB M.2 + 1TB HDD', sw: 'Ubuntu + CasaOS + Jellyfin'    },
                { name: 'VM2 · AI 에이전트', icon: '🤖', color: 'border-purple-500/60', badge: 'bg-purple-500/15 text-purple-300 border border-purple-500/30', cpu: '8 vCPU', ram: '20 GB', disk: '350GB M.2',          sw: 'Ollama(gemma2 9B) + Dify'       },
                { name: 'VM3 · Windows 11', icon: '💻', color: 'border-cyan-500/60',    badge: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30',      cpu: '6 vCPU', ram: '8 GB',  disk: '100GB M.2',          sw: 'Windows 11 Pro + Cursor'        },
                { name: 'Proxmox 호스트',   icon: '⚙️', color: 'border-slate-600',      badge: 'bg-slate-700/40 text-slate-400 border border-slate-600',      cpu: '공유',   ram: '~2 GB 예비', disk: '2GB M.2 (시스템)', sw: 'Proxmox VE 8.x 하이퍼바이저' },
              ]).map((vm, i) => (
                <div key={i} className={`bg-slate-900 rounded-xl p-4 border ${vm.color}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{vm.icon}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${vm.badge}`}>{vm.name}</span>
                  </div>
                  <div className="text-xs space-y-1.5">
                    <div className="flex justify-between"><span className="text-slate-500">CPU</span><span className="text-white font-mono">{vm.cpu}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">RAM</span><span className="text-white font-mono">{vm.ram}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">디스크</span><span className="text-white font-mono text-right">{vm.disk}</span></div>
                    <div className="pt-1 border-t border-slate-800 text-slate-500">{vm.sw}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Step Navigation ── */}
        <h2 className="text-xl font-bold text-white mb-4">🛠️ 단계별 설치 가이드</h2>
        <div className="flex flex-wrap gap-2 mb-5">
          {STEPS.map((s) => (
            <button
              key={s.id}
              onClick={() => goTo(s.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                activeStep === s.id
                  ? `bg-gradient-to-r ${s.color} border-transparent text-white shadow-lg shadow-black/30`
                  : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
              }`}
            >
              <span>{s.icon}</span>
              <span className="hidden md:inline">{s.title}</span>
              <span className="md:hidden text-xs">Step {s.id}</span>
            </button>
          ))}
        </div>

        {/* ── Step Content ── */}
        <div className="bg-slate-900/70 rounded-2xl border border-slate-700 overflow-hidden mb-8">
          <div className={`p-5 bg-gradient-to-r ${step.color} flex items-center gap-3`}>
            <span className="text-3xl">{step.icon}</span>
            <div className="flex-1">
              <div className="text-white font-black text-lg leading-tight">{step.title}</div>
              <div className="text-white/65 text-sm">{step.subtitle}</div>
            </div>
            <div className="text-white/40 text-sm font-mono">{activeStep + 1} / {STEPS.length}</div>
          </div>
          <div className="p-4 md:p-6 space-y-2">
            {step.sections.map((sec, i) => {
              const Body = sec.body;
              const isOpen = openSections.has(i);
              return (
                <div key={i} className="border border-slate-700 rounded-xl overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3.5 bg-slate-800 hover:bg-slate-800/80 text-left transition-colors"
                    onClick={() => toggleSection(i)}
                  >
                    <span className="font-semibold text-white text-sm">{sec.title}</span>
                    <span className={`text-slate-400 text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  {isOpen && (
                    <div className="p-5 bg-slate-900/50">
                      <Body />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between px-6 pb-6">
            <button onClick={() => goTo(Math.max(0, activeStep - 1))} disabled={activeStep === 0}
              className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-25 transition-colors text-sm">
              ← 이전 단계
            </button>
            <button onClick={() => goTo(Math.min(STEPS.length - 1, activeStep + 1))} disabled={activeStep === STEPS.length - 1}
              className="px-5 py-2 rounded-xl text-white font-semibold disabled:opacity-25 transition-opacity text-sm"
              style={{ background: 'linear-gradient(90deg, #0891b2, #7c3aed)' }}>
              다음 단계 →
            </button>
          </div>
        </div>

        {/* ── Quick Reference Table ── */}
        <div className="bg-slate-900/70 rounded-2xl border border-slate-700 p-5 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">📋 서비스 주소 & 포트 빠른 참조표</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 pr-4 text-slate-400 font-medium text-xs">서비스</th>
                  <th className="text-left py-2 pr-4 text-slate-400 font-medium text-xs">주소</th>
                  <th className="text-left py-2 text-slate-400 font-medium text-xs">용도</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {[
                  ['⚙️ Proxmox 관리 UI',  `https://${pxIP}:8006`,   'VM 생성·관리 웹 대시보드'],
                  ['🏠 CasaOS (NAS)',      `http://${nasIP}`,         '파일·스토리지 관리 대시보드'],
                  ['🎬 Jellyfin 스트리밍', `http://${nasIP}:8096`,    '미디어 서버 (Google TV·모바일)'],
                  ['📁 Samba 파일 공유',   `\\\\${nasIP}\\media`,     'Windows 네트워크 드라이브'],
                  ['🤖 Dify AI 빌더',      `http://${aiIP}`,          'AI 에이전트·워크플로우'],
                  ['🦙 Ollama API',        `http://${aiIP}:11434`,    'Gemma2 로컬 LLM API'],
                  ['💻 Windows RDP',       `${winIP}:3389`,           '원격 데스크탑 접속'],
                ].map(([svc, addr, use], i) => (
                  <tr key={i}>
                    <td className="py-2.5 pr-4 text-slate-300 whitespace-nowrap">{svc}</td>
                    <td className="py-2.5 pr-4 font-mono text-cyan-400 text-xs whitespace-nowrap">{addr}</td>
                    <td className="py-2.5 text-slate-500 text-xs">{use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Note type="info">상단 <strong>내 네트워크 설정</strong>에서 IP를 수정하면 이 표도 즉시 갱신됩니다.</Note>
        </div>

        {/* ── Footer ── */}
        <div className="text-center text-xs text-slate-700 pb-6 space-y-1">
          <p>모든 소프트웨어는 오픈소스 / 무료 라이선스 기반입니다.</p>
          <p>Proxmox VE · Ubuntu Server · CasaOS · Jellyfin · Samba · Docker · Ollama · Dify · PostgreSQL · PGVector</p>
        </div>
      </div>
    </div>
  );
}
