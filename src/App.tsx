import { useState } from 'react';
import { usePageStore } from '@/store/usePageStore';
import CodeBlock from '@/components/CodeBlock';
import Note from '@/components/Note';
import Checklist from '@/components/Checklist';
import ResourceBar from '@/components/ResourceBar';
import NightModeTimeline from '@/components/NightModeTimeline';
import BrowserBar from '@/components/BrowserBar';
import StepSummary from '@/components/StepSummary';
import WhereBox from '@/components/WhereBox';
import { deriveVMIPs } from '@/utils/network';

/* ──────────────────────────────────────────
   메인 앱
────────────────────────────────────────── */
export default function App() {
  /* ── 네트워크 설정 상태 ── */
  const [netConfig, setNetConfig] = useState({
    proxmoxIP: '192.168.200.200',
    prefix:    '24',
    gateway:   '192.168.200.1',
    dns:       '192.168.200.1',
  });

  /* ── 파생 변수 ── */
  const { nasIP, aiIP, winIP } = deriveVMIPs(netConfig.proxmoxIP);
  const pxIP = netConfig.proxmoxIP;
  const pfx  = netConfig.prefix;
  const gw   = netConfig.gateway;
  const dns  = netConfig.dns;

  /* ── UI 상태 ── */
  const { activeStep, setActiveStep } = usePageStore();
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
              <StepSummary
                goal="설치에 필요한 파일(ISO)을 USB 1개에 담아 준비합니다"
                time="30분~1시간"
                difficulty="쉬움"
                items={[
                  'USB 32GB 구매 (또는 준비)',
                  'Ventoy 프로그램으로 USB 포맷',
                  'ISO 파일 4개 다운로드 후 USB에 복사',
                ]}
                result="USB 하나로 4개 OS를 선택해서 부팅할 수 있는 상태"
              />
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
              <StepSummary
                goal="PC 한 대를 여러 컴퓨터(VM)로 쪼개주는 Proxmox를 설치합니다"
                time="30분~1시간"
                difficulty="보통"
                items={[
                  'USB로 PC를 부팅해 Proxmox 설치 마법사 실행',
                  'IP 주소·비밀번호 등 기본 설정 입력',
                  '설치 완료 후 같은 네트워크 PC 브라우저에서 웹 관리화면 접속',
                  '무료 업데이트 저장소로 전환',
                ]}
                result={`브라우저에서 https://${pxIP}:8006 으로 Proxmox 관리화면에 접속 가능한 상태`}
              />
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

              <p className="text-slate-300 text-sm font-semibold mt-3 mb-2">④ IP 재설정 — 원하는 IP로 바꾸기</p>

              {/* 1부 — 내 PC에서 공유기 IP 대역 먼저 확인 */}
              <div className="mb-5 p-4 bg-blue-900/20 rounded-xl border border-blue-500/30">
                <p className="font-semibold text-blue-200 text-sm mb-3">🔍 1부 — 내 PC에서 공유기 IP 대역 먼저 확인</p>
                <p className="text-xs text-slate-300 mb-3">Proxmox에 어떤 IP를 줘야 할지 모를 때, 내 PC에서 공유기 주소(게이트웨이)를 먼저 확인합니다.</p>
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-700 mb-3">
                  <p className="text-xs font-semibold text-slate-400 mb-1">💻 내 PC — Windows 명령 프롬프트(cmd)에서 실행</p>
                  <pre className="text-xs font-mono text-green-400">ipconfig</pre>
                </div>
                <div className="text-xs text-slate-300 mb-2">출력 결과에서 <strong className="text-white">기본 게이트웨이 (Default Gateway)</strong> 항목을 찾습니다:</div>
                <div className="p-3 rounded-lg bg-black/60 border border-slate-700 font-mono text-xs mb-3">
                  <div className="text-slate-500">이더넷 어댑터 이더넷:</div>
                  <div className="text-slate-400 pl-2">IPv4 주소 . . : <span className="text-cyan-400">192.168.200.xxx</span></div>
                  <div className="text-slate-400 pl-2">서브넷 마스크 : <span className="text-slate-400">255.255.255.0</span></div>
                  <div className="text-slate-400 pl-2">기본 게이트웨이 : <span className="text-amber-400">{gw}</span> ← 이 값이 공유기 주소!</div>
                </div>
                <div className="p-3 rounded-lg bg-emerald-900/20 border border-emerald-500/30 text-xs text-emerald-200">
                  <strong>결론:</strong> 게이트웨이가 <code className="bg-slate-800 px-1 rounded text-amber-300">{gw}</code> 라면, 공유기 대역은 <code className="bg-slate-800 px-1 rounded text-cyan-300">192.168.200.xxx</code> 입니다.<br/>
                  Proxmox IP는 이 대역의 비어있는 번호(예: <code className="bg-slate-800 px-1 rounded text-cyan-300">{pxIP}</code>)로 고정합니다.
                </div>
              </div>

              {/* 언제 필요한가 */}
              <div className="mb-4 p-4 bg-amber-900/20 rounded-xl border border-amber-500/30">
                <p className="font-semibold text-amber-200 text-sm mb-2">📌 이런 상황일 때 진행하세요</p>
                <div className="space-y-1.5 text-xs text-amber-300/80">
                  <div className="flex items-start gap-2"><span className="text-amber-400 flex-shrink-0">•</span><span>설치 때 입력한 IP({pxIP})와 실제 잡힌 IP가 다를 때</span></div>
                  <div className="flex items-start gap-2"><span className="text-amber-400 flex-shrink-0">•</span><span>브라우저에서 {pxIP}:8006 이 접속되지 않을 때</span></div>
                  <div className="flex items-start gap-2"><span className="text-amber-400 flex-shrink-0">•</span><span>IP를 처음부터 다른 값으로 바꾸고 싶을 때</span></div>
                </div>
              </div>

              {/* 현재 IP 확인 */}
              <p className="text-white font-semibold text-sm mb-1">STEP 1 — 현재 IP 확인</p>
              <p className="text-xs text-slate-400 mb-2">Proxmox 화면(콘솔)에서 아래 명령어로 현재 잡힌 IP를 먼저 확인합니다.</p>
              <CodeBlock label="Proxmox Shell" code={`ip addr show vmbr0\n\n# 출력 예시:\n# inet 10.179.93.200/24 brd ... → 이 숫자가 현재 IP\n#      ↑ 여기 나오는 IP가 실제 IP입니다`} />

              {/* 방법 선택 카드 */}
              <div className="my-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border-2 border-emerald-500/60 bg-emerald-900/10">
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white">방법 A · 추천</span>
                  <p className="text-white font-bold text-sm mt-2 mb-1">명령어 한 줄로 변경</p>
                  <p className="text-xs text-slate-400">복사·붙여넣기만 하면 끝. 파일 편집 불필요.</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-600 bg-slate-800/40">
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-slate-600 text-slate-300">방법 B</span>
                  <p className="text-white font-bold text-sm mt-2 mb-1">파일 직접 편집 (nano)</p>
                  <p className="text-xs text-slate-400">내용을 눈으로 확인하며 수정하고 싶을 때.</p>
                </div>
              </div>

              {/* 방법 A */}
              <div className="p-4 bg-emerald-900/10 rounded-xl border border-emerald-500/30 mb-4">
                <p className="text-emerald-300 font-bold text-sm mb-3">방법 A — 명령어 한 줄로 IP 전체 재작성 (가장 쉬움)</p>
                <p className="text-xs text-slate-400 mb-2">아래 명령어를 <strong className="text-white">그대로 복사</strong>해서 붙여넣으면, 상단 네트워크 설정의 IP가 자동으로 들어갑니다.</p>
                <CodeBlock label="Proxmox Shell" code={`# 설정 파일을 올바른 내용으로 통째로 덮어쓰기\ncat > /etc/network/interfaces << 'EOF'\nauto lo\niface lo inet loopback\n\niface ens18 inet manual\n\nauto vmbr0\niface vmbr0 inet static\n    address ${pxIP}/${pfx}\n    gateway ${gw}\n    nameserver ${dns}\n    bridge-ports ens18\n    bridge-stp off\n    bridge-fd 0\nEOF\n\necho "✓ 파일 저장 완료"`} />
                <Note type="easy">이 명령어는 파일을 열거나 편집할 필요 없이 올바른 내용으로 한 번에 교체합니다. 실행 후 <strong>STEP 3(적용)</strong>으로 바로 이동하세요.</Note>
              </div>

              {/* 방법 B */}
              <details className="mb-4 rounded-xl border border-slate-700 overflow-hidden">
                <summary className="px-4 py-3 bg-slate-800 text-sm font-semibold text-slate-300 cursor-pointer hover:bg-slate-700 transition-colors select-none">
                  방법 B — nano 편집기로 직접 수정하기 (클릭해서 펼치기)
                </summary>
                <div className="p-4 bg-slate-900/50 space-y-3">
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <p className="text-xs font-semibold text-slate-400 mb-1">🖊 nano란?</p>
                    <p className="text-xs text-slate-300">터미널에서 파일을 열고 수정하는 메모장 같은 프로그램입니다. 마우스 없이 키보드만으로 사용하며, 방향키(↑↓←→)로 이동, 직접 타이핑으로 수정합니다.</p>
                  </div>

                  <p className="text-white font-semibold text-xs">① 파일 열기</p>
                  <CodeBlock label="Proxmox Shell" code={`nano /etc/network/interfaces`} />

                  <p className="text-white font-semibold text-xs">② 아래 내용과 똑같이 맞추기</p>
                  <p className="text-xs text-slate-400">방향키로 커서 이동 → 잘못된 IP 부분을 찾아 올바른 값으로 수정합니다.</p>
                  <CodeBlock label="/etc/network/interfaces — 올바른 내용" code={`auto lo\niface lo inet loopback\n\niface ens18 inet manual\n\nauto vmbr0\niface vmbr0 inet static\n    address ${pxIP}/${pfx}\n    gateway ${gw}\n    nameserver ${dns}\n    bridge-ports ens18\n    bridge-stp off\n    bridge-fd 0`} />

                  <p className="text-white font-semibold text-xs">③ 저장하고 닫기</p>
                  <div className="space-y-2">
                    {[
                      { key: 'Ctrl + X', desc: '종료 시도 — 화면 하단에 "Save modified buffer?" 메시지가 뜸' },
                      { key: 'Y',        desc: 'Y 키 입력 → 저장하겠다는 뜻' },
                      { key: 'Enter',    desc: '파일 이름 확인 → Enter 누르면 저장 완료, nano 종료' },
                    ].map(({ key, desc }) => (
                      <div key={key} className="flex items-start gap-3">
                        <kbd className="px-2 py-1 bg-slate-700 border border-slate-500 rounded text-xs font-mono text-cyan-300 whitespace-nowrap flex-shrink-0">{key}</kbd>
                        <span className="text-xs text-slate-300">{desc}</span>
                      </div>
                    ))}
                  </div>

                  {/* nano 화면 시뮬레이션 */}
                  <div className="rounded-xl overflow-hidden border border-slate-600">
                    <div className="bg-slate-800 px-4 py-2 text-xs text-slate-400 font-mono">nano 화면 하단 단축키 (^ = Ctrl 키)</div>
                    <div className="bg-black p-3 font-mono text-xs">
                      <div className="text-slate-600 grid grid-cols-2 gap-x-4 gap-y-0.5">
                        {[['^G', 'Help'], ['^X', 'Exit(종료)'], ['^O', 'Write Out(저장)'], ['^W', 'Where Is(검색)'], ['^K', 'Cut(잘라내기)'], ['^U', 'Paste(붙여넣기)']].map(([k, v]) => (
                          <span key={k}><span className="text-white">{k}</span> {v}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </details>

              {/* STEP 3: 적용 */}
              <p className="text-white font-semibold text-sm mb-1">STEP 2 — 변경 내용 적용</p>
              <p className="text-xs text-slate-400 mb-2">방법 A 또는 B로 파일을 수정한 뒤, 아래 명령어로 네트워크를 재시작해야 변경이 반영됩니다.</p>
              <CodeBlock label="Proxmox Shell — 네트워크 재시작 및 IP 확인" code={`# 네트워크 서비스 재시작\nsystemctl restart networking\n\n# 잠시 후 IP 확인 (아래처럼 나오면 성공!)\nip addr show vmbr0\n# 기대 출력: inet ${pxIP}/${pfx} ...`} />

              {/* 성공/실패 확인 */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-emerald-900/20 border border-emerald-500/30">
                  <p className="text-xs font-bold text-emerald-400 mb-1">✓ 성공했을 때</p>
                  <p className="text-xs text-slate-400">출력에 <code className="text-cyan-400">{pxIP}</code> 가 보이고, 브라우저에서 <code className="text-cyan-400">{pxIP}:8006</code> 접속이 됩니다.</p>
                </div>
                <div className="p-3 rounded-xl bg-red-900/20 border border-red-500/30">
                  <p className="text-xs font-bold text-red-400 mb-1">✗ 여전히 안 될 때</p>
                  <p className="text-xs text-slate-400">PC를 완전히 재부팅(<code className="text-cyan-400">reboot</code>) 후 다시 시도하세요. 재부팅 후에도 안 되면 IP·게이트웨이 값을 다시 확인합니다.</p>
                </div>
              </div>

              {/* 3부 — 네트워크 연결 검증 */}
              <div className="mt-5 p-4 bg-cyan-900/15 rounded-xl border border-cyan-500/30">
                <p className="font-semibold text-cyan-200 text-sm mb-3">📡 3부 — 네트워크 연결 상태 크로스 체크</p>
                <p className="text-xs text-slate-400 mb-3">IP를 바꾼 뒤 실제로 인터넷과 포트가 열렸는지 두 가지로 확인합니다.</p>

                <p className="text-white font-semibold text-xs mb-1">① Proxmox에서 인터넷 연결 확인 (ping)</p>
                <CodeBlock label="Proxmox Shell" code={`ping -c 4 8.8.8.8\n# 4 packets transmitted, 4 received, 0% packet loss → 성공!`} />

                <p className="text-white font-semibold text-xs mt-3 mb-1">② 내 PC에서 Proxmox 웹 UI 포트 확인 (PowerShell)</p>
                <CodeBlock label="내 PC — PowerShell" code={`Test-NetConnection ${pxIP} -Port 8006\n# TcpTestSucceeded : True → 성공!`} />

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-lg bg-emerald-900/20 border border-emerald-500/30">
                    <p className="font-bold text-emerald-400 mb-1">ping 성공 조건</p>
                    <p className="text-slate-400"><code className="text-cyan-400">0% packet loss</code> 또는 모든 패킷 수신</p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-900/20 border border-emerald-500/30">
                    <p className="font-bold text-emerald-400 mb-1">포트 성공 조건</p>
                    <p className="text-slate-400"><code className="text-cyan-400">TcpTestSucceeded : True</code> 표시</p>
                  </div>
                </div>
              </div>

              <p className="text-slate-300 text-sm font-semibold mt-4 mb-2">⑤ 웹 관리 UI 접속 확인</p>
              <p className="text-xs text-slate-400 mb-1">IP가 확인되면 <strong>같은 네트워크의 다른 PC</strong> 브라우저에서 접속합니다.</p>
              <BrowserBar url={`https://${pxIP}:8006`} />
              <Note type="tip">"연결이 안전하지 않습니다" 경고 → '고급' → '<strong>{pxIP}으로 이동</strong>' 클릭. 자체 서명 인증서라 정상입니다. 사용자명 <code className="bg-slate-700 px-1 rounded text-cyan-400">root</code>, 비밀번호는 설치 시 설정값. "유효한 구독 없음" 팝업 → 확인 클릭 무시.</Note>
            </>
          ),
        },
        {
          title: '🛑 무료 버전 저장소 설정 (필수)',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-3">
                Proxmox 무료 버전은 기본적으로 <strong>유료 엔터프라이즈 저장소</strong>가 활성화되어 있어
                <code className="bg-slate-800 px-1 rounded text-red-400 text-xs mx-1">apt-get update</code> 실행 시 인증 에러가 발생합니다.
                이 단계에서 지뢰를 제거합니다.
              </p>

              <Note type="warn">이 단계를 건너뛰면 이후 모든 <code>apt</code> 명령이 유료 구독 오류로 실패합니다. <strong>Proxmox 설치 직후 반드시 실행하세요.</strong></Note>

              <p className="text-white font-semibold text-sm mt-4 mb-2">방법 A — 빠른 방법 (추천)</p>
              <p className="text-xs text-slate-400 mb-2">유료 저장소 설정 파일을 통째로 삭제한 후 패키지 목록을 갱신합니다.</p>
              <CodeBlock label="Proxmox Shell" code={`# 유료 구독 저장소 설정 파일 전체 삭제\nrm -f /etc/apt/sources.list.d/*\n\n# 패키지 목록 갱신 (에러 없이 완료되면 성공!)\napt-get update`} />

              <div className="mt-3 p-3 rounded-xl bg-black/50 border border-slate-700 font-mono text-xs">
                <p className="text-slate-500 mb-1">성공 시 출력 화면:</p>
                <p className="text-green-400">Reading package lists... Done</p>
                <p className="text-slate-500">Building dependency tree... Done</p>
                <p className="text-slate-500">All packages are up to date.</p>
              </div>

              <p className="text-white font-semibold text-sm mt-5 mb-2">방법 B — 무료 저장소도 추가하기 (선택)</p>
              <p className="text-xs text-slate-400 mb-2">Proxmox 공식 무료 저장소를 추가하면 이후 패키지 업그레이드도 가능합니다.</p>
              <CodeBlock label="Proxmox Shell" code={`# 유료 저장소 주석 처리\nsed -i 's/^deb/# deb/' /etc/apt/sources.list.d/pve-enterprise.list 2>/dev/null || true\nsed -i 's/^deb/# deb/' /etc/apt/sources.list.d/ceph.list 2>/dev/null || true\n\n# 무료 저장소 추가\necho "deb http://download.proxmox.com/debian/pve bookworm pve-no-subscription" \\\n  >> /etc/apt/sources.list\n\n# 업데이트 및 업그레이드\napt update && apt upgrade -y`} />
              <Note type="tip">최초 1회만 실행하면 됩니다. 이후 정기적인 업데이트는 <code>apt update && apt upgrade -y</code>만 입력하면 됩니다.</Note>
            </>
          ),
        },
        {
          title: '🔒 Tailscale 설치 — Proxmox 호스트 (필수)',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-3">
                Proxmox 본체(호스트)에 Tailscale을 설치하면 집 밖에서도 웹 관리 UI에 안전하게 접속할 수 있습니다.
                <strong className="text-white"> VM을 만들기 전에 먼저 호스트에 설치</strong>해두는 것이 좋습니다.
              </p>

              <Note type="warn">무료 저장소 설정(위 단계)이 완료된 후 진행하세요. 저장소가 설정되지 않으면 설치가 실패합니다.</Note>

              {/* 설치 흐름 */}
              <div className="my-4 p-4 bg-slate-800/60 rounded-xl border border-teal-500/30">
                <p className="text-xs font-semibold text-teal-300 mb-3">📋 Proxmox Tailscale 설치 흐름</p>
                <div className="flex flex-col gap-1.5 text-xs">
                  {[
                    { n: '1', t: 'Tailscale 공식 스크립트로 설치', c: 'text-white' },
                    { n: '2', t: 'tailscale up 실행 → 인증 URL 출력', c: 'text-white' },
                    { n: '3', t: '스마트폰 또는 PC 브라우저에서 인증 URL 열기 → 계정 로그인', c: 'text-white' },
                    { n: '4', t: '인증 완료 → Tailscale IP (100.x.x.x) 자동 부여', c: 'text-emerald-400' },
                    { n: '5', t: '외부에서 해당 IP:8006 으로 Proxmox 웹 UI 접속 가능', c: 'text-emerald-400' },
                  ].map(({ n, t, c }) => (
                    <div key={n} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">{n}</span>
                      <span className={`text-xs ${c}`}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-white font-semibold text-sm mb-2">① 설치 명령어</p>
              <p className="text-xs text-slate-400 mb-2">Proxmox 웹 UI → homelab → <strong>Shell</strong> 탭에서 실행합니다.</p>
              <CodeBlock label="Proxmox Shell" code={`# Tailscale 공식 자동 설치 스크립트\ncurl -fsSL https://tailscale.com/install.sh | sh\n\n# 설치 확인\ntailscale version`} />

              <p className="text-white font-semibold text-sm mt-4 mb-2">② 가동 및 계정 인증</p>
              <CodeBlock label="Proxmox Shell" code={`sudo tailscale up\n\n# 출력 예:\n# To authenticate, visit:\n# https://login.tailscale.com/a/XXXXXXXXXX  ← 이 URL을 브라우저에서 열기`} />
              <Note type="easy">출력된 URL을 스마트폰 또는 PC 브라우저에서 열면 카카오·구글·GitHub 계정으로 로그인하는 화면이 나옵니다. 로그인하면 인증 완료!</Note>

              <p className="text-white font-semibold text-sm mt-4 mb-2">③ Tailscale IP 확인</p>
              <CodeBlock label="Proxmox Shell" code={`tailscale ip -4\n# 출력 예: 100.100.208.66  ← 집 밖에서 이 IP로 Proxmox 접속`} />

              <p className="text-white font-semibold text-sm mt-4 mb-2">④ 재부팅 후 자동 유지 설정</p>
              <CodeBlock label="Proxmox Shell" code={`# 서비스 자동 시작 등록 (재부팅 후에도 Tailscale 유지)\nsystemctl enable tailscaled\n\n# 상태 확인\nsystemctl status tailscaled | grep Active`} />

              {/* 완료 확인 카드 */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-emerald-900/20 border border-emerald-500/30">
                  <p className="text-xs font-bold text-emerald-400 mb-1">✓ 집 안 접속 주소</p>
                  <BrowserBar url={`https://${pxIP}:8006`} />
                </div>
                <div className="p-3 rounded-xl bg-purple-900/20 border border-purple-500/30">
                  <p className="text-xs font-bold text-purple-400 mb-1">✓ 집 밖 접속 주소 (Tailscale)</p>
                  <p className="text-xs text-slate-400 font-mono">https://[tailscale ip -4 출력값]:8006</p>
                  <p className="text-xs text-slate-500 mt-1">예: https://100.100.208.66:8006</p>
                </div>
              </div>

              <Note type="info">Proxmox 호스트 설치 완료! 이후 <strong>각 VM(NAS, AI 서버)에도 Tailscale을 설치</strong>해야 합니다. VM 설치 후 해당 STEP에서 진행합니다.</Note>
            </>
          ),
        },
      ],
    },

    /* ══════════════════════════════════════ STEP 2 게이트웨이 & 외부 접속 */
    {
      id: 2, title: '게이트웨이 & 외부 접속', subtitle: '공유기 설정 · Tailscale · 포트 포워딩', icon: '🌐', color: 'from-teal-500 to-cyan-600',
      sections: [
        {
          title: '게이트웨이(공유기) 설정 — 왜 필요한가?',
          body: () => (
            <>
              <StepSummary
                goal="공유기(딜라이브)에서 IP 예약과 외부 접속을 설정합니다"
                time="20~30분"
                difficulty="보통"
                items={[
                  '딜라이브 공유기 관리 페이지 로그인',
                  '각 VM에 고정 IP 예약 (재부팅해도 IP 유지)',
                  'Tailscale 설치로 외부 어디서든 홈랩 접속 (추천)',
                ]}
                result="집 밖에서도 스마트폰·노트북으로 NAS·AI 서버에 안전하게 접속 가능"
              />
              <p className="text-slate-300 text-sm mb-4">
                홈랩의 모든 VM은 공유기(게이트웨이)를 통해 인터넷에 연결됩니다.
                공유기에서 IP 예약과 외부 접속을 설정해두면 재부팅해도 항상 같은 IP를 유지하고, 집 밖에서도 서버에 접속할 수 있습니다.
              </p>

              {/* 네트워크 구조 다이어그램 */}
              <div className="p-4 bg-slate-800/60 rounded-xl border border-teal-500/30 mb-6">
                <p className="text-xs font-semibold text-teal-300 mb-3">🔌 홈랩 네트워크 구조</p>
                <div className="flex flex-col gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-slate-700 border border-slate-600 text-slate-300">🌍 인터넷</span>
                    <span className="text-slate-600">──</span>
                    <span className="px-2 py-1 rounded bg-teal-900/40 border border-teal-500/50 text-teal-300">🔧 딜라이브 공유기 (192.168.200.254)</span>
                  </div>
                  <div className="ml-4 pl-4 border-l-2 border-slate-700 flex flex-col gap-1.5">
                    {[
                      { icon: '⚙️', label: 'Proxmox 호스트', ip: pxIP },
                      { icon: '🗄️', label: 'VM1 · NAS',      ip: nasIP },
                      { icon: '🤖', label: 'VM2 · AI',        ip: aiIP },
                      { icon: '💻', label: 'VM3 · Windows',   ip: winIP },
                    ].map(({ icon, label, ip }) => (
                      <div key={ip} className="flex items-center gap-2">
                        <span className="text-slate-600">├─</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">{icon} {label}</span>
                        <span className="text-cyan-400">{ip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 딜라이브 공유기 접속 */}
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-teal-500 text-white">딜라이브 (Netis 공유기)</span>
              </div>
              <p className="text-white font-semibold text-sm mb-3">① 공유기 관리 페이지 접속</p>
              <p className="text-xs text-slate-400 mb-2">홈랩 PC와 <strong className="text-white">같은 공유기에 연결된</strong> PC 또는 노트북의 브라우저에서 아래 주소를 입력합니다.</p>
              <BrowserBar url="http://192.168.200.254:10010" className="mb-3" />
              <Note type="info">구버전 딜라이브 공유기는 포트가 <code className="bg-slate-700 px-1 rounded text-cyan-400">:8080</code> 일 수 있습니다. 위 주소가 안 열리면 <code className="bg-slate-700 px-1 rounded text-cyan-400">http://192.168.200.254:8080</code> 을 시도해보세요.</Note>

              {/* 로그인 방법 */}
              <p className="text-white font-semibold text-sm mt-5 mb-2">② 관리자 로그인</p>
              <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 mb-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">아이디 (Username)</p>
                    <div className="bg-slate-900 border border-slate-600 rounded px-3 py-2 font-mono text-cyan-400 text-sm">admin</div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">비밀번호 (Password)</p>
                    <div className="bg-slate-900 border border-slate-600 rounded px-3 py-2 font-mono text-cyan-400 text-sm">admin<span className="text-amber-400">XXXX</span></div>
                    <p className="text-xs text-slate-500 mt-1"><span className="text-amber-400">XXXX</span> = Wi-Fi 이름(SSID) 마지막 숫자 4자리</p>
                  </div>
                </div>
              </div>

              {/* 비밀번호 찾는 방법 */}
              <div className="p-4 bg-amber-900/15 rounded-xl border border-amber-500/30 mb-4">
                <p className="text-xs font-semibold text-amber-300 mb-2">📋 비밀번호 숫자 4자리 찾는 방법</p>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">A</span>
                    <div>
                      <p className="font-semibold">공유기 본체 확인 (가장 쉬움)</p>
                      <p className="text-slate-400">공유기 상단 또는 뒷면 스티커 → <strong className="text-white">SSID</strong> 또는 <strong className="text-white">Wi-Fi 이름</strong> 항목의 마지막 숫자 4자리</p>
                      <p className="text-slate-500 mt-0.5">예: SSID가 <code className="bg-slate-800 px-1 rounded text-amber-300">Dlive_1234</code> 이면 비밀번호 → <code className="bg-slate-800 px-1 rounded text-cyan-400">admin1234</code></p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">B</span>
                    <div>
                      <p className="font-semibold">시리얼 번호로 확인</p>
                      <p className="text-slate-400">공유기 뒷면 <strong className="text-white">시리얼 번호</strong> 마지막 4자리를 admin 뒤에 붙입니다.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">C</span>
                    <div>
                      <p className="font-semibold text-slate-400">초기화</p>
                      <p className="text-slate-500">위 방법 모두 실패 시 공유기 뒷면 Reset 버튼을 10초 이상 눌러 초기화 후 재시도</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 로그인 후 화면 */}
              <p className="text-white font-semibold text-sm mb-2">③ 로그인 후 — 관리 메뉴 구조</p>
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-700">
                <p className="text-xs text-slate-500 mb-3">딜라이브(Netis) 공유기 관리 페이지 주요 메뉴</p>
                <div className="space-y-2 text-xs">
                  {[
                    { menu: '상태(Status)',           desc: '연결된 기기 목록, IP 현황 확인',                     color: 'text-slate-400' },
                    { menu: 'LAN 설정',               desc: 'DHCP 서버 설정 → 여기서 IP 예약(Static IP)',         color: 'text-cyan-300'  },
                    { menu: '포트 포워딩 / 가상 서버', desc: '외부 포트 → 내부 IP:포트 매핑 설정',                 color: 'text-amber-300' },
                    { menu: '무선 설정',               desc: 'Wi-Fi 이름(SSID) · 비밀번호 변경',                  color: 'text-slate-400' },
                    { menu: '고급 설정',               desc: 'DMZ · UPnP · 펌웨어 업데이트',                     color: 'text-slate-400' },
                  ].map(({ menu, desc, color }) => (
                    <div key={menu} className="flex items-start gap-3 py-1.5 border-b border-slate-800 last:border-0">
                      <span className={`font-semibold w-36 flex-shrink-0 ${color}`}>{menu}</span>
                      <span className="text-slate-500">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Note type="tip">다음 섹션의 <strong>DHCP 예약</strong>은 'LAN 설정' 메뉴, <strong>포트 포워딩</strong>은 '포트 포워딩 / 가상 서버' 메뉴에서 진행합니다.</Note>
            </>
          ),
        },
        {
          title: '공유기 DHCP 예약 — 고정 IP 할당',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-3">
                MAC 주소를 기반으로 항상 같은 IP를 할당합니다. Ubuntu 설치 시 Manual IP를 입력했더라도, 공유기에서도 예약해두면 이중으로 안전합니다.
              </p>

              <div className="space-y-2.5 mb-4">
                {[
                  ['1', '공유기 관리 페이지 로그인'],
                  ['2', '고급 설정 → DHCP 서버 → 정적 IP 할당 (또는 "IP 예약") 메뉴'],
                  ['3', '각 기기의 MAC 주소 확인 (아래 명령어 참고)'],
                  ['4', 'MAC 주소 + 할당할 IP 입력 후 저장'],
                  ['5', '기기 재부팅 → IP 유지 확인'],
                ].map(([n, t]) => (
                  <div key={n} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">{n}</span>
                    <span className="text-sm text-slate-300">{t}</span>
                  </div>
                ))}
              </div>

              <p className="text-white font-semibold text-sm mb-2">MAC 주소 확인 명령어</p>
              <CodeBlock label="Proxmox Shell — 호스트 MAC" code={`ip link show | grep -A1 'vmbr0'\n# link/ether xx:xx:xx:xx:xx:xx`} />
              <CodeBlock label="각 VM SSH — VM MAC" code={`ip link show ens18\n# link/ether xx:xx:xx:xx:xx:xx`} />

              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-2 pr-3 text-slate-400 font-medium">기기</th>
                      <th className="text-left py-2 pr-3 text-slate-400 font-medium">예약 IP</th>
                      <th className="text-left py-2 text-slate-400 font-medium">메모</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {[
                      { device: '⚙️ Proxmox 호스트', ip: pxIP,  note: 'Proxmox 웹 UI 접속용' },
                      { device: '🗄️ VM1 · NAS',      ip: nasIP, note: 'Portainer · Jellyfin · Immich · Samba' },
                      { device: '🤖 VM2 · AI',        ip: aiIP,  note: 'Ollama · Dify' },
                      { device: '💻 VM3 · Windows',   ip: winIP, note: 'RDP 원격 접속' },
                    ].map(({ device, ip, note }) => (
                      <tr key={ip}>
                        <td className="py-2 pr-3 text-slate-300">{device}</td>
                        <td className="py-2 pr-3 font-mono text-cyan-400">{ip}</td>
                        <td className="py-2 text-slate-500">{note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ),
        },
        {
          title: '방법 1 · Tailscale VPN — 외부 접속 (추천)',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-4">
                집 밖에서 NAS·AI·Proxmox에 접속하는 가장 쉽고 안전한 방법입니다.
                공유기 설정 없이 <strong className="text-white">5분 설치</strong>로 어디서든 내부 IP처럼 접속할 수 있습니다.
              </p>

              {/* 장점 요약 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {[
                  { icon: '🔒', label: '보안 우수',      desc: '포트 외부 노출 없음' },
                  { icon: '⚡', label: '5분 설치',       desc: '스크립트 한 줄' },
                  { icon: '📱', label: '앱 제공',        desc: 'iOS·Android·Windows' },
                  { icon: '🆓', label: '무료',           desc: '100대 디바이스' },
                ].map(({ icon, label, desc }) => (
                  <div key={label} className="p-3 rounded-xl bg-emerald-900/10 border border-emerald-500/30 text-center">
                    <div className="text-xl mb-1">{icon}</div>
                    <div className="text-xs font-bold text-emerald-300">{label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                  </div>
                ))}
              </div>

              <p className="text-white font-semibold text-sm mb-2">① Tailscale 계정 생성</p>
              <p className="text-xs text-slate-400 mb-2">Google / GitHub / Microsoft 계정으로 바로 가입 가능합니다.</p>
              <BrowserBar url="https://tailscale.com" className="mb-4" />

              <p className="text-white font-semibold text-sm mb-2">② Proxmox 호스트에 설치 (가장 먼저)</p>
              <p className="text-xs text-slate-400 mb-2">Proxmox 웹 UI → homelab → Shell 탭에서 실행합니다. (STEP 1 마지막 섹션에서 이미 완료했다면 건너뛰세요.)</p>
              <CodeBlock label="Proxmox Shell" code={`curl -fsSL https://tailscale.com/install.sh | sh\nsudo tailscale up\n# 출력된 URL을 브라우저에서 열어 계정 연결\nsystemctl enable tailscaled  # 재부팅 후 자동 유지`} />

              <p className="text-white font-semibold text-sm mt-4 mb-2">③ 각 VM에도 설치 (NAS · AI 순서로)</p>
              <p className="text-xs text-slate-400 mb-2">Proxmox에 먼저 설치한 <strong className="text-white">같은 계정</strong>으로 로그인합니다. VM별 상세 내용은 각 STEP을 참고하세요.</p>
              <CodeBlock label="NAS VM SSH (ares 계정) — STEP 3에서 상세 안내" code={`ssh ares@${nasIP}\ncurl -fsSL https://tailscale.com/install.sh | sh\nsudo tailscale up\nsystemctl enable tailscaled`} />
              <CodeBlock label="AI VM SSH — STEP 4에서 상세 안내" code={`ssh ubuntu@${aiIP}\ncurl -fsSL https://tailscale.com/install.sh | sh\nsudo tailscale up\nsystemctl enable tailscaled`} />

              <p className="text-white font-semibold text-sm mt-4 mb-2">④ Tailscale IP 확인</p>
              <CodeBlock label="각 서버 SSH" code={`tailscale ip -4\n# 출력 예: 100.64.x.x`} />

              <p className="text-white font-semibold text-sm mt-4 mb-2">⑤ Subnet Router — 기존 내부 IP 그대로 사용 (선택)</p>
              <p className="text-xs text-slate-400 mb-2">Proxmox 호스트에 한 번만 설정하면, 내부 전체 네트워크를 Tailscale로 접근 가능합니다.</p>
              <CodeBlock label="Proxmox Shell" code={`sudo tailscale up --advertise-routes=${pxIP.split('.').slice(0,3).join('.')}.0/${pfx} --accept-routes\n# Tailscale 관리 콘솔에서 Routes 승인 필요\n# admin.tailscale.com → 해당 기기 → Edit route settings`} />

              <div className="mt-4 p-4 bg-slate-900 rounded-xl border border-slate-700">
                <p className="text-sm font-semibold text-white mb-2">Subnet Router 설정 후 — 외부에서 내부 IP 그대로 접속</p>
                <div className="space-y-1.5 text-xs font-mono">
                  {[
                    { label: 'Proxmox 웹 UI', url: `https://${pxIP}:8006` },
                    { label: 'Portainer',     url: `http://${nasIP}:9000` },
                    { label: 'Jellyfin',      url: `http://${nasIP}:8096` },
                    { label: 'Immich 사진',   url: `http://${nasIP}:2283` },
                    { label: 'Dify AI',       url: `http://${aiIP}` },
                  ].map(({ label, url }) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-slate-500 w-24 flex-shrink-0">{label}</span>
                      <span className="text-cyan-400">{url}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-white font-semibold text-sm mt-4 mb-2">⑥ 스마트폰 / PC에 Tailscale 앱 설치</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { os: '📱 Android', desc: 'Play Store → "Tailscale" 설치' },
                  { os: '📱 iOS',     desc: 'App Store → "Tailscale" 설치' },
                  { os: '💻 Windows / Mac', desc: 'tailscale.com/download 에서 설치' },
                ].map(({ os, desc }) => (
                  <div key={os} className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs">
                    <p className="text-white font-semibold mb-1">{os}</p>
                    <p className="text-slate-400">{desc}</p>
                    <p className="text-slate-600 mt-1">→ 같은 계정으로 로그인</p>
                  </div>
                ))}
              </div>
              <Note type="tip">모든 기기에 같은 Tailscale 계정으로 로그인하면 자동으로 같은 사설 네트워크로 묶입니다.</Note>

              {/* 최종 접속 대시보드 */}
              <div className="mt-5 p-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-teal-500/40">
                <p className="font-semibold text-teal-200 text-sm mb-1">🎯 Tailscale 설치 완료 — 최종 접속 주소 확인</p>
                <p className="text-xs text-slate-400 mb-3">설치 후 아래 명령어로 Tailscale IP를 확인합니다.</p>
                <CodeBlock label="Proxmox Shell" code={`tailscale ip -4\n# 출력 예: 100.100.208.66`} />
                <p className="text-xs text-slate-400 mb-3 mt-3">확인된 IP로 아래 두 주소가 생성됩니다:</p>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-emerald-900/20 border border-emerald-500/30">
                    <p className="text-xs font-bold text-emerald-300 mb-1">🏠 집 안에서 접속</p>
                    <BrowserBar url={`https://${pxIP}:8006`} />
                  </div>
                  <div className="p-3 rounded-lg bg-purple-900/20 border border-purple-500/30">
                    <p className="text-xs font-bold text-purple-300 mb-1">🌍 집 밖에서 접속 (Tailscale 앱 활성화 필요)</p>
                    <BrowserBar url="https://100.100.208.66:8006" />
                    <p className="text-xs text-slate-500 mt-1">* 위 IP는 예시입니다. 실제 <code className="text-cyan-400">tailscale ip -4</code> 출력값을 사용하세요.</p>
                  </div>
                </div>
              </div>

              {/* 트러블슈팅 */}
              <div className="mt-5 p-4 bg-amber-900/15 rounded-xl border border-amber-500/30">
                <p className="font-semibold text-amber-200 text-sm mb-3">🔧 Tailscale 설치 시 자주 발생하는 오류</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-2 pr-3 text-slate-400 font-medium">오류 증상</th>
                        <th className="text-left py-2 pr-3 text-slate-400 font-medium">원인</th>
                        <th className="text-left py-2 text-slate-400 font-medium">해결 명령어</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {[
                        { symptom: 'ip_forwarding 경고 메시지', cause: '라우팅 비활성화', fix: 'sysctl -w net.ipv4.ip_forward=1' },
                        { symptom: 'Subnet routes 미인식', cause: 'Tailscale 콘솔 승인 필요', fix: 'admin.tailscale.com → Routes 승인' },
                        { symptom: '기기가 오프라인으로 표시', cause: 'tailscaled 서비스 미실행', fix: 'systemctl restart tailscaled' },
                        { symptom: '재부팅 후 연결 끊김', cause: '서비스 자동시작 미등록', fix: 'systemctl enable tailscaled' },
                        { symptom: '인증 만료 / 재연결 불가', cause: '세션 만료', fix: 'tailscale up --reset' },
                      ].map(({ symptom, cause, fix }) => (
                        <tr key={symptom}>
                          <td className="py-2 pr-3 text-amber-300">{symptom}</td>
                          <td className="py-2 pr-3 text-slate-400">{cause}</td>
                          <td className="py-2 font-mono text-cyan-400 text-xs">{fix}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Note type="info">VM2 AI 에이전트 설정 완료 후, <strong>Tailscale 오류 점검 에이전트</strong>가 위 진단을 자동으로 수행하고 카카오톡으로 결과를 알려줍니다.</Note>
              </div>
            </>
          ),
        },
        {
          title: '방법 2 · 포트 포워딩 — 외부 접속 (대안)',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-3">
                Tailscale을 사용하기 어렵거나, Jellyfin처럼 특정 서비스를 불특정 다수에게 공개할 때 사용합니다.
              </p>
              <Note type="warn">포트를 외부에 직접 개방하므로 반드시 각 서비스에 <strong>강력한 비밀번호</strong>를 설정한 뒤 진행하세요.</Note>

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
                      { svc: '⚙️ Proxmox 웹 UI', ext: '8006', int: `${pxIP}:8006`,  proto: 'TCP', color: 'text-amber-300' },
                      { svc: '🎬 Jellyfin',       ext: '8096', int: `${nasIP}:8096`, proto: 'TCP', color: 'text-blue-300'  },
                      { svc: '📸 Immich',          ext: '2283', int: `${nasIP}:2283`, proto: 'TCP', color: 'text-pink-300'  },
                      { svc: '🐳 Portainer',       ext: '9000', int: `${nasIP}:9000`, proto: 'TCP', color: 'text-cyan-300'  },
                      { svc: '🤖 Dify AI',         ext: '3000', int: `${aiIP}:80`,    proto: 'TCP', color: 'text-purple-300'},
                      { svc: '🔒 SSH (NAS)',        ext: '2222', int: `${nasIP}:22`,   proto: 'TCP', color: 'text-emerald-300'},
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

              <div className="space-y-2.5 mb-4">
                {[
                  ['1', `공유기 관리 페이지 접속: http://${gw}`],
                  ['2', '고급 설정 → NAT/라우터 관리 → 포트 포워딩 (또는 "가상 서버") 메뉴'],
                  ['3', '위 표의 각 행을 규칙으로 추가 — 외부 포트 / 내부 IP:포트 / TCP'],
                  ['4', '저장 후 외부 IP 확인'],
                ].map(([n, t]) => (
                  <div key={n} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">{n}</span>
                    <span className="text-sm text-slate-300">{t}</span>
                  </div>
                ))}
              </div>

              <p className="text-white font-semibold text-sm mb-2">내 외부 IP 확인</p>
              <CodeBlock label="터미널" code={`curl ifconfig.me`} />
              <Note type="tip">외부 IP가 자주 바뀐다면 <strong>DuckDNS</strong>(무료 DDNS)를 설정해 고정 도메인으로 접속하세요. duckdns.org에서 5분 만에 설정 가능합니다.</Note>
            </>
          ),
        },
      ],
    },

    /* ══════════════════════════════════════ STEP 2 NAS */
    {
      id: 3, title: 'VM1 · NAS 서버', subtitle: 'Ubuntu + Portainer + Jellyfin + Immich + Samba', icon: '🗄️', color: 'from-blue-500 to-cyan-500',
      sections: [
        {
          title: 'Proxmox 웹 UI 접속하기',
          body: () => (
            <>
              <StepSummary
                goal="NAS 서버(VM)를 만들기 위해 Proxmox 관리화면에 접속합니다"
                time="약 2시간"
                difficulty="보통"
                items={[
                  'Proxmox 웹 관리화면에 로그인',
                  'VM 만들기로 NAS 가상컴퓨터 생성',
                  'Ubuntu Linux 설치 (NAS의 운영체제)',
                  'Portainer(Docker 관리) · Jellyfin(영상 스트리밍) · Immich(사진 관리) · Samba(윈도우 공유) 설치',
                ]}
                result={`브라우저에서 http://${nasIP}:9000 으로 Portainer 대시보드 접속, 영상 스트리밍·사진 백업 가능`}
              />
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
                      {n === '3' && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-slate-600">
                          <div className="bg-slate-700 px-3 py-1.5 text-xs text-slate-400 font-mono flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="w-2 h-2 rounded-full bg-yellow-500" />
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="ml-1 truncate">{`https://${pxIP}:8006`}</span>
                          </div>
                          <div className="bg-slate-950 px-4 py-4">
                            <div className="max-w-xs mx-auto space-y-2.5">
                              <p className="text-center text-white font-bold text-sm mb-3">Proxmox Virtual Environment</p>
                              <div>
                                <p className="text-xs text-slate-500 mb-1">Username</p>
                                <div className="bg-slate-800 border border-cyan-500/60 rounded px-3 py-2 text-sm font-mono text-cyan-400 flex items-center justify-between">
                                  <span>root</span>
                                  <span className="text-xs text-slate-600">← 여기에 입력</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 mb-1">Password</p>
                                <div className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm font-mono text-slate-400 flex items-center justify-between">
                                  <span>••••••••</span>
                                  <span className="text-xs text-slate-600">← 설치 시 설정값</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 mb-1">Realm</p>
                                <div className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-xs text-slate-500">Linux PAM standard authentication</div>
                              </div>
                              <div className="bg-blue-600 rounded px-3 py-2 text-center text-sm text-white font-semibold">Login</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
          title: '🐳 Portainer 설치 (Docker 관리 대시보드)',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-3">
                Portainer는 Docker 컨테이너를 웹 브라우저에서 시각적으로 관리하는 오픈소스 대시보드입니다.
                Immich·Jellyfin 등 컨테이너 기반 서비스를 한눈에 확인하고 제어할 수 있습니다.
              </p>

              {/* 특징 카드 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {[
                  { icon: '🖥️', label: '웹 UI',       desc: '브라우저로 컨테이너 관리' },
                  { icon: '📦', label: '스택 관리',   desc: 'docker-compose 파일 배포' },
                  { icon: '📊', label: '리소스 모니터', desc: 'CPU·RAM·네트워크 실시간' },
                  { icon: '🔒', label: '무료 CE',      desc: 'Community Edition 영구 무료' },
                ].map(c => (
                  <div key={c.label} className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-center text-xs">
                    <div className="text-xl mb-1">{c.icon}</div>
                    <p className="text-white font-semibold mb-0.5">{c.label}</p>
                    <p className="text-slate-500">{c.desc}</p>
                  </div>
                ))}
              </div>

              <Note type="info">Immich 설치 단계에서 Docker를 설치했다면 아래 단계로 바로 진행하세요. Docker가 없다면 먼저 설치합니다.</Note>

              {/* Docker 확인 */}
              <p className="text-white font-semibold text-sm mt-4 mb-2">① Docker 설치 확인</p>
              <CodeBlock label="NAS VM SSH" code={`# Docker 버전 확인 (설치되어 있으면 버전 출력)\ndocker --version\n\n# 없다면 설치\ncurl -fsSL https://get.docker.com | sudo bash\nsudo usermod -aG docker $USER\nnewgrp docker`} />

              {/* Portainer 설치 */}
              <p className="text-white font-semibold text-sm mt-4 mb-2">② Portainer CE 설치</p>
              <CodeBlock label="NAS VM SSH" code={`# Portainer 데이터 저장 볼륨 생성\ndocker volume create portainer_data\n\n# Portainer 컨테이너 실행\ndocker run -d \\\n  --name portainer \\\n  --restart=always \\\n  -p 8000:8000 \\\n  -p 9000:9000 \\\n  -v /var/run/docker.sock:/var/run/docker.sock \\\n  -v portainer_data:/data \\\n  portainer/portainer-ce:latest\n\n# 실행 확인\ndocker ps | grep portainer`} />

              <p className="text-slate-300 text-sm my-2">설치 완료 후 브라우저에서 초기 접속 (처음 5분 이내 접속 필수):</p>
              <BrowserBar url={`http://${nasIP}:9000`} />

              <Note type="warn">Portainer는 처음 실행 후 <strong>5분 이내</strong>에 접속해서 관리자 계정을 생성해야 합니다. 시간이 지나면 컨테이너를 재시작해야 합니다.</Note>

              {/* 초기 설정 */}
              <p className="text-white font-semibold text-sm mt-4 mb-2">③ 초기 관리자 계정 생성</p>
              <div className="space-y-2 mb-3">
                {[
                  { step: '1', desc: '브라우저에서 위 주소 접속 → 관리자 아이디·비밀번호 입력 (비밀번호 12자 이상)' },
                  { step: '2', desc: '"Get Started" 클릭 → "local" 환경 선택' },
                  { step: '3', desc: '대시보드 진입 — 실행 중인 Docker 컨테이너 목록 확인' },
                ].map(s => (
                  <div key={s.step} className="flex items-start gap-3 p-3 bg-slate-800 rounded-xl border border-slate-700 text-xs">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold flex-shrink-0">{s.step}</span>
                    <span className="text-slate-300">{s.desc}</span>
                  </div>
                ))}
              </div>

              <Note type="tip">Portainer에서 Immich·Jellyfin의 컨테이너 상태, 로그, 재시작을 마우스 클릭으로 관리할 수 있습니다.</Note>

              {/* 외부 접속 */}
              <p className="text-white font-semibold text-sm mt-4 mb-2">④ Tailscale IP로 외부 접속</p>
              <BrowserBar url={`http://100.95.120.25:9000`} />
              <Note type="easy">위 주소는 Tailscale 설치 후 NAS Tailscale IP가 확인된 경우의 예시입니다. <code className="text-cyan-400">tailscale ip -4</code> 로 실제 IP를 확인하세요.</Note>
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
          title: '📸 Immich 설치 (사진·영상 관리)',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-3">
                Immich는 Google 포토 대체제로 불리는 오픈소스 사진 관리 솔루션입니다. 자동 백업, 얼굴 인식, 지도 보기, 앨범, 공유 기능을 모두 무료로 제공합니다.
              </p>

              {/* 특징 카드 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {[
                  { icon: '📱', label: '모바일 앱', desc: 'iOS · Android 자동 백업' },
                  { icon: '👤', label: '얼굴 인식', desc: 'AI 기반 인물 분류' },
                  { icon: '🗺️', label: '지도 보기', desc: 'GPS 태그 사진 지도 표시' },
                  { icon: '🔒', label: '완전 자가 호스팅', desc: '내 서버, 내 데이터' },
                ].map(c => (
                  <div key={c.label} className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-center text-xs">
                    <div className="text-xl mb-1">{c.icon}</div>
                    <p className="text-white font-semibold mb-0.5">{c.label}</p>
                    <p className="text-slate-500">{c.desc}</p>
                  </div>
                ))}
              </div>

              {/* 설치 — Docker Compose */}
              <p className="text-white font-semibold text-sm mb-2">① Docker 설치 (처음 한 번만)</p>
              <CodeBlock label="NAS VM SSH" code={`# Docker 공식 설치 스크립트\ncurl -fsSL https://get.docker.com | sudo bash\n\n# 현재 사용자를 docker 그룹에 추가 (재로그인 필요)\nsudo usermod -aG docker $USER\nnewgrp docker`} />

              <p className="text-white font-semibold text-sm mt-4 mb-2">② Immich 설치 폴더 및 설정 파일 생성</p>
              <CodeBlock label="NAS VM SSH" code={`# 설치 폴더 생성\nmkdir -p ~/immich && cd ~/immich\n\n# 공식 docker-compose.yml 다운로드\nwget -O docker-compose.yml https://github.com/immich-app/immich/releases/latest/download/docker-compose.yml\n\n# 환경 변수 파일 다운로드\nwget -O .env https://github.com/immich-app/immich/releases/latest/download/example.env`} />

              <p className="text-white font-semibold text-sm mt-4 mb-2">③ 사진 저장 경로 설정 (.env 편집)</p>
              <CodeBlock label="NAS VM SSH" code={`nano ~/immich/.env`} />
              <div className="my-2 p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono space-y-1">
                <p className="text-slate-500"># .env 파일에서 아래 항목만 수정하세요</p>
                <p><span className="text-slate-400">UPLOAD_LOCATION=</span><span className="text-cyan-400">/data/photos</span></p>
                <p><span className="text-slate-400">DB_DATA_LOCATION=</span><span className="text-cyan-400">/data/immich-db</span></p>
              </div>
              <CodeBlock label="NAS VM SSH" code={`# 사진 저장 폴더 생성\nsudo mkdir -p /data/photos /data/immich-db\nsudo chown -R $USER:$USER /data/photos /data/immich-db`} />

              <p className="text-white font-semibold text-sm mt-4 mb-2">④ Immich 실행</p>
              <CodeBlock label="NAS VM SSH" code={`cd ~/immich\n\n# 백그라운드로 실행 (처음 실행 시 이미지 다운로드 약 5~10분 소요)\ndocker compose up -d\n\n# 실행 상태 확인 (모두 Up 이어야 정상)\ndocker compose ps`} />

              <p className="text-slate-300 text-sm my-2">실행 후 브라우저에서 초기 설정 접속:</p>
              <BrowserBar url={`http://${nasIP}:2283`} />

              <Note type="tip">처음 접속하면 관리자 계정 생성 화면이 나옵니다. 이름·이메일·비밀번호를 입력하면 바로 사용할 수 있습니다.</Note>

              <p className="text-white font-semibold text-sm mt-4 mb-2">⑤ 모바일 앱 연결 (자동 백업)</p>
              <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    { os: '📱 Android', store: 'Google Play Store → Immich 검색 설치', server: `http://${nasIP}:2283` },
                    { os: '🍎 iOS', store: 'App Store → Immich 검색 설치', server: `http://${nasIP}:2283` },
                  ].map(a => (
                    <div key={a.os} className="space-y-1">
                      <p className="text-white font-semibold">{a.os}</p>
                      <p className="text-slate-400">1. {a.store}</p>
                      <p className="text-slate-400">2. 서버 주소 입력: <code className="text-cyan-400">{a.server}</code></p>
                      <p className="text-slate-400">3. 계정 로그인 → 백업 활성화</p>
                    </div>
                  ))}
                </div>
              </div>

              <Note type="info">외부(카페, 회사 등)에서도 사진을 자동 백업하려면 Tailscale IP(<code className="text-cyan-400">http://100.95.120.25:2283</code>)를 서버 주소로 입력하세요.</Note>

              <p className="text-white font-semibold text-sm mt-4 mb-2">⑥ 재부팅 후 자동 시작 설정</p>
              <CodeBlock label="NAS VM SSH" code={`# Immich 자동 시작 서비스 등록\nsudo tee /etc/systemd/system/immich.service << 'EOF'\n[Unit]\nDescription=Immich Photo Server\nAfter=docker.service\nRequires=docker.service\n\n[Service]\nType=oneshot\nRemainAfterExit=yes\nWorkingDirectory=/home/ares/immich\nExecStart=/usr/bin/docker compose up -d\nExecStop=/usr/bin/docker compose down\n\n[Install]\nWantedBy=multi-user.target\nEOF\n\nsudo systemctl enable immich\nsudo systemctl daemon-reload`} />

              <Note type="easy">Immich 업데이트는 <code>cd ~/immich && docker compose pull && docker compose up -d</code> 한 줄로 가능합니다.</Note>
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
          title: '🔒 방법 1 · Tailscale VPN 설치 — NAS VM (필수)',
          body: () => (
            <>
              <div className="mb-4 p-3 rounded-xl bg-teal-900/20 border border-teal-500/40 flex items-start gap-3">
                <span className="text-xl flex-shrink-0">🔗</span>
                <div>
                  <p className="text-teal-300 font-semibold text-sm mb-1">Proxmox 호스트에도 설치했나요?</p>
                  <p className="text-xs text-slate-400">STEP 1 마지막 섹션에서 <strong className="text-white">Proxmox 호스트에 먼저 Tailscale을 설치</strong>해야 합니다.
                    완료했다면 같은 방법으로 <strong className="text-white">NAS VM에도 추가 설치</strong>합니다.
                    모든 기기에 같은 계정으로 로그인하면 하나의 가상 네트워크로 자동으로 묶입니다.</p>
                </div>
              </div>

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
              <p className="text-xs text-slate-400 mb-2">NAS VM에 SSH로 접속한 뒤 아래 명령어를 실행합니다.</p>
              <CodeBlock label="NAS VM SSH (ares 계정)" code={`# NAS VM SSH 접속\nssh ares@${nasIP}\n\n# Tailscale 공식 설치 스크립트\ncurl -fsSL https://tailscale.com/install.sh | sh\n\n# Tailscale 시작 및 로그인\nsudo tailscale up\n\n# 출력된 URL을 브라우저에서 열어 계정 연결 (Proxmox 때와 동일 계정!)\n# https://login.tailscale.com/a/xxxxxxxx\n\n# ✅ 재부팅 후 자동 시작 설정 (필수)\nsudo systemctl enable tailscaled`} />

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
                <p className="text-xs text-slate-500 mb-2">Tailscale 연결 후 — 집 밖 어디서든 아래 주소로 접속 (100.x.x.x = NAS Tailscale IP)</p>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center gap-3"><span className="text-slate-500 w-20">Jellyfin</span><span className="text-cyan-400">http://100.x.x.x:8096</span></div>
                  <div className="flex items-center gap-3"><span className="text-slate-500 w-20">Immich</span><span className="text-cyan-400">http://100.x.x.x:2283</span></div>
                  <div className="flex items-center gap-3"><span className="text-slate-500 w-20">Portainer</span><span className="text-cyan-400">http://100.x.x.x:9000</span></div>
                  <div className="flex items-center gap-3"><span className="text-slate-500 w-20">SSH</span><span className="text-cyan-400">ssh ares@100.x.x.x</span></div>
                </div>
                <p className="text-xs text-slate-600 mt-2">* 내부 접속(집 안): ssh ares@{nasIP} / 외부 접속(집 밖): ssh ares@[Tailscale IP]</p>
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
          title: '🚀 Tailscale IP로 내 PC에서 SSH 직접 접속',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-4">
                Tailscale 설치가 완료되면 Proxmox 웹 콘솔을 열지 않아도
                <strong className="text-white"> 내 PC 터미널에서 NAS 서버에 바로 접속</strong>할 수 있습니다.
                이 방법이 작업 효율이 훨씬 높습니다.
              </p>

              {/* Tailscale IP 확인 */}
              <div className="mb-4 p-4 bg-teal-900/20 rounded-xl border border-teal-500/30">
                <p className="font-semibold text-teal-200 text-sm mb-2">① NAS의 Tailscale IP 확인</p>
                <p className="text-xs text-slate-400 mb-2">NAS VM SSH 또는 Proxmox Console에서 확인합니다.</p>
                <CodeBlock label="NAS VM" code={`tailscale ip -4\n# 출력 예: 100.95.120.25  ← 이 IP가 외부 전용 NAS 주소`} />
                <div className="mt-3 p-3 rounded-lg bg-slate-900/60 border border-slate-700 text-xs text-slate-300">
                  화면에 보이는 <code className="text-cyan-400 font-mono">100.95.120.25</code> 같은 주소가 바로
                  <strong className="text-white"> 집 밖 어디서나 NAS에 다이렉트로 접속할 수 있는 NAS 전용 Tailscale IP</strong>입니다.
                  이 IP는 Proxmox Tailscale IP(100.100.208.66)와 <strong className="text-white">다른 별도 주소</strong>입니다.
                </div>
              </div>

              {/* 내 PC에서 SSH */}
              <p className="font-semibold text-white text-sm mb-3">② 내 PC 터미널에서 SSH 접속</p>
              <p className="text-xs text-slate-400 mb-2">
                Windows 검색창에서 <strong className="text-white">PowerShell</strong> 또는 <strong className="text-white">CMD</strong>를 검색해 실행합니다.
              </p>
              <CodeBlock label="내 PC — PowerShell / CMD" code={`ssh ares@100.95.120.25\n# 실제 IP는 위에서 확인한 tailscale ip -4 값으로 바꾸세요`} />

              {/* 첫 접속 경고 */}
              <div className="mt-4 mb-3 p-4 bg-slate-800 rounded-xl border border-slate-700">
                <p className="text-sm font-semibold text-amber-300 mb-3">⚠️ 첫 접속 시 보안 확인 문구 — 당황하지 마세요!</p>
                <div className="rounded-lg overflow-hidden border border-slate-600 mb-3">
                  <div className="bg-slate-900 px-3 py-1.5 text-xs text-slate-400 font-mono">PowerShell 출력 화면</div>
                  <pre className="bg-black p-3 text-xs font-mono text-yellow-300 leading-relaxed">{`The authenticity of host '100.95.120.25 (100.95.120.25)' can't be established.
ED25519 key fingerprint is SHA256:xxxxxxxxxxxxxxxxxxxx.
Are you sure you want to continue connecting (yes/no/[fingerprint])? _`}</pre>
                </div>
                <div className="flex items-start gap-3 p-3 bg-emerald-900/20 rounded-lg border border-emerald-500/30">
                  <span className="text-emerald-400 text-lg flex-shrink-0">✓</span>
                  <div>
                    <p className="text-emerald-300 font-semibold text-xs mb-1">해결: <code className="bg-slate-800 px-1 rounded font-mono">yes</code> 입력 후 Enter</p>
                    <p className="text-xs text-slate-400">처음 접속하는 서버를 신뢰하겠냐는 질문입니다. <code className="text-cyan-400">yes</code>를 입력하면 이후 접속부터는 이 문구가 나오지 않습니다.</p>
                  </div>
                </div>
              </div>

              {/* 비밀번호 입력 */}
              <div className="mb-3 p-4 bg-slate-800 rounded-xl border border-slate-700">
                <p className="text-sm font-semibold text-white mb-3">🔑 비밀번호 입력</p>
                <div className="rounded-lg overflow-hidden border border-slate-600 mb-3">
                  <div className="bg-slate-900 px-3 py-1.5 text-xs text-slate-400 font-mono">PowerShell 출력 화면</div>
                  <pre className="bg-black p-3 text-xs font-mono text-green-400 leading-relaxed">{`ares@100.95.120.25's password: _`}</pre>
                </div>
                <Note type="easy">비밀번호를 입력해도 화면에 글자가 보이지 않는 것은 <strong>정상</strong>입니다. 리눅스 보안 기능으로, 입력은 되고 있으니 그대로 타이핑 후 Enter를 누르세요.</Note>
              </div>

              {/* 성공 화면 */}
              <div className="mb-4 p-4 bg-slate-800 rounded-xl border border-slate-700">
                <p className="text-sm font-semibold text-emerald-300 mb-3">✅ 접속 성공 화면</p>
                <div className="rounded-lg overflow-hidden border border-slate-600">
                  <div className="bg-slate-900 px-3 py-1.5 text-xs text-slate-400 font-mono">PowerShell — 로그인 완료</div>
                  <pre className="bg-black p-3 text-xs font-mono text-green-400 leading-relaxed">{`Welcome to Ubuntu 24.04 LTS (GNU/Linux 6.8.0-xx-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com

Last login: ...

ares@pve-nas:~$ _`}</pre>
                </div>
                <div className="mt-3 p-3 bg-emerald-900/20 rounded-lg border border-emerald-500/30 text-xs">
                  <p className="text-emerald-300 font-semibold mb-1">🎉 <code className="font-mono">ares@pve-nas:~$</code> 프롬프트가 보이면 완벽하게 접속된 것입니다!</p>
                  <p className="text-slate-400">이제 Proxmox 웹 콘솔은 닫아도 됩니다. 앞으로의 모든 NAS 세팅은 이 PowerShell 창에서 진행합니다.</p>
                </div>
              </div>

              {/* 복사 붙여넣기 팁 */}
              <div className="p-4 bg-blue-900/15 rounded-xl border border-blue-500/30">
                <p className="font-semibold text-blue-200 text-sm mb-3">💡 작업 효율 200% — 복사·붙여넣기 팁</p>
                <div className="space-y-2 text-xs">
                  {[
                    { os: '💻 Windows PowerShell', copy: 'Ctrl + C', paste: 'Ctrl + V 또는 마우스 우클릭' },
                    { os: '💻 Windows CMD',        copy: '드래그 후 Enter',  paste: '마우스 우클릭' },
                    { os: '🍎 macOS 터미널',        copy: 'Cmd + C',  paste: 'Cmd + V' },
                  ].map(({ os, copy, paste }) => (
                    <div key={os} className="flex items-center gap-3 py-1.5 border-b border-slate-800/50 last:border-0">
                      <span className="text-slate-300 w-36 flex-shrink-0">{os}</span>
                      <span className="text-slate-500">복사: <kbd className="px-1.5 py-0.5 bg-slate-700 border border-slate-500 rounded text-xs font-mono text-cyan-300">{copy}</kbd></span>
                      <span className="text-slate-500">붙여넣기: <kbd className="px-1.5 py-0.5 bg-slate-700 border border-slate-500 rounded text-xs font-mono text-cyan-300">{paste}</kbd></span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">이 가이드의 명령어를 복사해서 PowerShell에 붙여넣기 하면 오타 없이 실행할 수 있습니다.</p>
              </div>
            </>
          ),
        },
        {
          title: '🌐 Cockpit — 브라우저로 우분투 관리 (강력 추천)',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-3">
                검은색 터미널이 불편하다면 <strong className="text-white">Cockpit</strong>을 설치하세요.
                크롬·엣지 같은 웹 브라우저에서 마우스로 우분투를 관리할 수 있는 무료 오픈소스 웹 콘솔입니다.
              </p>

              {/* Cockpit vs CLI 비교 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="p-4 rounded-xl border-2 border-emerald-500/60 bg-emerald-900/10">
                  <p className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white inline-block mb-2">⭐ Cockpit (추천)</p>
                  <ul className="text-xs text-slate-300 space-y-1">
                    <li className="flex gap-1.5"><span className="text-emerald-400">✓</span> 브라우저에서 마우스로 조작</li>
                    <li className="flex gap-1.5"><span className="text-emerald-400">✓</span> CPU·메모리·디스크 실시간 그래프</li>
                    <li className="flex gap-1.5"><span className="text-emerald-400">✓</span> 서비스 시작·중지 클릭 한 번</li>
                    <li className="flex gap-1.5"><span className="text-emerald-400">✓</span> 브라우저 내 터미널도 제공</li>
                    <li className="flex gap-1.5"><span className="text-emerald-400">✓</span> Tailscale IP로 외부에서도 접속</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl border border-slate-600 bg-slate-800/40">
                  <p className="text-xs font-black px-2 py-0.5 rounded-full bg-slate-600 text-slate-300 inline-block mb-2">SSH (기본)</p>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li className="flex gap-1.5"><span className="text-slate-500">–</span> 텍스트 명령어 직접 입력</li>
                    <li className="flex gap-1.5"><span className="text-slate-500">–</span> 상태 확인 시 명령어 필요</li>
                    <li className="flex gap-1.5"><span className="text-slate-500">–</span> 숙련자에게 더 빠름</li>
                    <li className="flex gap-1.5"><span className="text-slate-500">–</span> 추가 설치 불필요</li>
                  </ul>
                </div>
              </div>

              <p className="text-white font-semibold text-sm mb-2">① Cockpit 설치</p>
              <p className="text-xs text-slate-400 mb-2">NAS VM SSH 또는 Proxmox Console에서 아래 명령어를 실행합니다.</p>
              <CodeBlock label="NAS VM SSH" code={`sudo apt update && sudo apt install -y cockpit\n\n# 서비스 시작 및 자동 시작 등록\nsudo systemctl enable --now cockpit.socket\n\n# 상태 확인\nsudo systemctl status cockpit.socket`} />

              <p className="text-white font-semibold text-sm mt-4 mb-2">② 브라우저에서 접속</p>
              <p className="text-xs text-slate-400 mb-2">설치 완료 후 웹 브라우저에서 아래 주소로 접속합니다.</p>

              <div className="space-y-2 mb-3">
                <div className="p-3 rounded-lg bg-emerald-900/20 border border-emerald-500/30">
                  <p className="text-xs font-bold text-emerald-300 mb-1">🏠 집 안에서 접속</p>
                  <BrowserBar url={`http://${nasIP}:9090`} />
                </div>
                <div className="p-3 rounded-lg bg-purple-900/20 border border-purple-500/30">
                  <p className="text-xs font-bold text-purple-300 mb-1">🌍 집 밖에서 접속 (Tailscale IP)</p>
                  <BrowserBar url="http://100.95.120.25:9090" />
                  <p className="text-xs text-slate-500 mt-1">* 실제 NAS Tailscale IP로 교체하세요 (<code className="text-cyan-400">tailscale ip -4</code>)</p>
                </div>
              </div>

              <Note type="easy">로그인 창에서 우분투 계정 ID(<code className="text-cyan-400">ares</code>)와 비밀번호를 입력하면 됩니다. Proxmox 비밀번호가 아닌 우분투 설치 시 설정한 비밀번호입니다.</Note>

              {/* Cockpit 화면 미리보기 */}
              <div className="mt-4 p-4 bg-slate-800 rounded-xl border border-slate-700">
                <p className="text-xs font-semibold text-slate-400 mb-3">Cockpit 주요 기능</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { icon: '📊', label: '시스템 개요', desc: 'CPU·메모리·디스크 실시간 확인' },
                    { icon: '📋', label: '로그 (Logs)', desc: '시스템 오류 로그 확인' },
                    { icon: '💾', label: '스토리지', desc: '디스크 마운트·사용량 관리' },
                    { icon: '🌐', label: '네트워킹', desc: 'IP·방화벽 설정' },
                    { icon: '⚙️', label: '서비스', desc: '서비스 시작·중지·재시작' },
                    { icon: '🖥️', label: '터미널', desc: '브라우저 안에서 SSH 터미널' },
                  ].map(({ icon, label, desc }) => (
                    <div key={label} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700">
                      <p className="text-white font-semibold mb-0.5">{icon} {label}</p>
                      <p className="text-slate-500">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ),
        },
        {
          title: '📡 Tailscale 관리 대시보드 — 연결 기기 확인',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-4">
                내 Tailscale 망에 연결된 모든 기기(Proxmox, NAS, 스마트폰 등)의 상태를 웹 브라우저에서 확인하고 관리합니다.
              </p>

              <p className="text-white font-semibold text-sm mb-2">① Tailscale 관리 콘솔 접속</p>
              <BrowserBar url="https://login.tailscale.com" className="mb-3" />

              <p className="text-white font-semibold text-sm mt-4 mb-2">② Machines 메뉴 확인</p>
              <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 mb-3">
                <p className="text-xs text-slate-500 mb-3">admin.tailscale.com → <strong className="text-white">Machines</strong> 탭</p>
                <div className="space-y-2">
                  {[
                    { name: 'homelab (Proxmox)', ip: '100.100.208.66', status: 'Connected', color: 'text-emerald-400' },
                    { name: 'pve-nas (NAS VM)',   ip: '100.95.120.25',  status: 'Connected', color: 'text-emerald-400' },
                    { name: '내 PC / 스마트폰',    ip: '100.x.x.x',     status: 'Connected', color: 'text-cyan-400' },
                  ].map(({ name, ip, status, color }) => (
                    <div key={name} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-700 text-xs font-mono">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${status === 'Connected' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                      <span className="text-white w-44 flex-shrink-0">{name}</span>
                      <span className={color}>{ip}</span>
                      <span className={`ml-auto ${color}`}>{status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Note type="info">
                <strong>pve-nas</strong>가 목록에 나타나고 <span className="text-emerald-400 font-semibold">Connected</span> 상태이면 NAS Tailscale 설치 완료입니다.
                기기가 보이지 않으면 NAS VM에서 <code>sudo tailscale up</code>을 다시 실행하세요.
              </Note>

              <p className="text-white font-semibold text-sm mt-4 mb-2">Tailscale 관리 콘솔에서 할 수 있는 것</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['🔒 키 만료 비활성화', '기기 선택 → Disable key expiry (재인증 불필요)'],
                  ['🛡️ 접근 제어 (ACL)', '어떤 기기가 어떤 기기에 접속할 수 있는지 설정'],
                  ['🌐 Subnet Router 승인', 'Proxmox Routes 승인 → 내부 IP로 외부 접속'],
                  ['📱 기기 삭제·이름 변경', '분실·교체 기기 관리'],
                ].map(([k, v]) => (
                  <div key={k as string} className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs">
                    <p className="text-white font-semibold mb-1">{k}</p>
                    <p className="text-slate-500">{v}</p>
                  </div>
                ))}
              </div>
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
                      { svc: '📸 Immich',    ext: '2283', int: `${nasIP}:2283`, proto: 'TCP', color: 'text-pink-300' },
                      { svc: '🐳 Portainer', ext: '9000', int: `${nasIP}:9000`, proto: 'TCP', color: 'text-cyan-300' },
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
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-20">Portainer</span><span className="text-cyan-400">http://[외부IP]:9000</span></div>
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
      id: 4, title: 'VM2 · AI 에이전트', subtitle: 'Ollama + CrewAI + KakaoTalk 자동화', icon: '🤖', color: 'from-purple-600 to-violet-700',
      sections: [
        {
          title: 'VM 생성 설정 (VM ID: 101)',
          body: () => (
            <>
              <StepSummary
                goal="로컬 AI 엔진(Ollama)과 CrewAI 에이전트로 자동화 시스템을 구축합니다"
                time="약 2시간"
                difficulty="보통~어려움"
                items={[
                  'AI VM(가상컴퓨터) 생성 후 Ubuntu 설치',
                  'Docker + Ollama 설치 — 로컬 LLM 엔진 구동',
                  'CrewAI 설치 — Python 기반 에이전트 프레임워크',
                  '모닝브리핑 에이전트 — 매일 07:00 카카오톡 자동 발송',
                  '문서 정리 에이전트 — NAS 파일 자동 분류',
                  'Tailscale 오류 점검 에이전트 — Proxmox 자동 진단',
                ]}
                result="매일 아침 카카오톡으로 브리핑을 받고, NAS 문서가 자동으로 정리됩니다"
              />
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
              <Note type="info">Gemma2 9B 모델은 약 6~8GB RAM을 사용합니다. 20GB를 배분하면 Ollama + CrewAI 에이전트 동시 구동이 충분합니다.</Note>
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
          title: 'CrewAI 설치 및 환경 구성',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-3">
                CrewAI는 여러 AI 에이전트가 역할을 나눠 협력하는 Python 프레임워크입니다.
                각 에이전트(Agent)에게 역할·목표·도구를 부여하고, 태스크(Task)를 순서대로 실행합니다.
              </p>

              {/* 구조 다이어그램 */}
              <div className="p-4 bg-slate-800/60 rounded-xl border border-purple-500/30 mb-4">
                <p className="text-xs font-semibold text-purple-300 mb-3">🤖 CrewAI 구조</p>
                <div className="flex flex-col gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-purple-900/40 border border-purple-500/50 text-purple-300">Crew (팀)</span>
                    <span className="text-slate-600">→ 에이전트 + 태스크 묶음</span>
                  </div>
                  <div className="ml-4 pl-4 border-l-2 border-slate-700 flex flex-col gap-1.5">
                    {[
                      { icon: '👨‍💼', label: 'Agent (역할)', desc: 'researcher · writer · sender ...' },
                      { icon: '📋', label: 'Task (작업)',  desc: '검색하기 · 요약하기 · 발송하기 ...' },
                      { icon: '🔧', label: 'Tool (도구)',  desc: '웹검색 · 파일읽기 · HTTP 요청 ...' },
                      { icon: '🧠', label: 'LLM (두뇌)',   desc: `Ollama (gemma2:2b) @ ${aiIP}:11434` },
                    ].map(({ icon, label, desc }) => (
                      <div key={label} className="flex items-center gap-2">
                        <span className="text-slate-600">├─</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">{icon} {label}</span>
                        <span className="text-slate-500">{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-white font-semibold text-sm mb-2">① Python 3.11 및 가상환경 설치</p>
              <CodeBlock label="AI VM SSH" code={`sudo apt install -y python3.11 python3-pip python3.11-venv\n\n# Python 버전 확인\npython3.11 --version`} />

              <p className="text-white font-semibold text-sm mt-4 mb-2">② CrewAI 프로젝트 디렉토리 및 가상환경 생성</p>
              <CodeBlock label="AI VM SSH" code={`mkdir ~/crewai && cd ~/crewai\npython3.11 -m venv .venv\nsource .venv/bin/activate\n\n# 프롬프트가 (.venv) 로 바뀌면 성공\n(.venv) ubuntu@ai-agent:~/crewai$`} />

              <p className="text-white font-semibold text-sm mt-4 mb-2">③ CrewAI 및 필수 패키지 설치</p>
              <CodeBlock label="AI VM SSH (.venv 활성화 상태)" code={`pip install crewai crewai-tools paramiko requests\n\n# 설치 확인\npython3 -c "import crewai; print(crewai.__version__)"`} />

              <p className="text-white font-semibold text-sm mt-4 mb-2">④ Ollama LLM 연동 테스트</p>
              <CodeBlock label="AI VM SSH (.venv 활성화 상태)" code={`python3 << 'EOF'\nfrom crewai import LLM\nllm = LLM(\n    model="ollama/gemma2:2b",\n    base_url="http://localhost:11434"\n)\nresponse = llm.call("안녕하세요! 간단히 자기소개 해주세요.")\nprint(response)\nEOF`} />

              <div className="mt-3 p-3 rounded-xl bg-emerald-900/20 border border-emerald-500/30 text-xs">
                <p className="text-emerald-300 font-semibold mb-1">✓ 성공 기준</p>
                <p className="text-slate-400">Gemma2 모델의 한국어 응답이 터미널에 출력되면 Ollama ↔ CrewAI 연동 완료입니다.</p>
              </div>

              <p className="text-white font-semibold text-sm mt-4 mb-2">⑤ 환경 변수 파일 생성</p>
              <CodeBlock label="AI VM SSH" code={`cat > ~/crewai/.env << 'EOF'\n# Ollama 설정\nOLLAMA_BASE_URL=http://localhost:11434\nOLLAMA_MODEL=gemma2:2b\n\n# 카카오 API (다음 섹션에서 발급)\nKAKAO_ACCESS_TOKEN=여기에_입력\n\n# Proxmox SSH 접속 (Tailscale 오류 점검용)\nPROXMOX_HOST=${pxIP}\nPROXMOX_USER=root\nPROXMOX_PASSWORD=여기에_입력\nEOF`} />
              <Note type="tip">`.env` 파일에는 비밀번호·API 키가 들어가므로 <code>chmod 600 ~/crewai/.env</code> 로 권한을 제한하세요.</Note>
            </>
          ),
        },
        {
          title: '📬 모닝브리핑 에이전트 — 카카오톡 자동 발송',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-4">
                매일 오전 7시, CrewAI 에이전트가 뉴스·날씨를 수집하고 요약해서 카카오톡 <strong>나에게 보내기</strong>로 자동 전송합니다.
              </p>

              {/* 카카오 API 설정 */}
              <div className="mb-5 p-4 bg-yellow-900/20 rounded-xl border border-yellow-500/30">
                <p className="font-semibold text-yellow-200 text-sm mb-3">① 카카오 REST API 키 발급</p>
                <div className="space-y-3 text-xs text-slate-300">
                  {[
                    ['1', 'developers.kakao.com 접속 → 카카오 계정 로그인'],
                    ['2', '내 애플리케이션 → 애플리케이션 추가하기'],
                    ['3', '앱 이름: homelab-briefing / 사업자명: 개인'],
                    ['4', '앱 설정 → 플랫폼 → Web → 사이트 도메인: http://localhost 추가'],
                    ['5', '앱 키 탭에서 REST API 키 복사 → .env 파일의 KAKAO_ACCESS_TOKEN 에 임시 저장'],
                    ['6', '제품 설정 → 카카오 로그인 → 활성화 ON → Redirect URI: http://localhost'],
                    ['7', '동의항목 → 카카오톡 메시지 전송 → 필수 동의로 설정'],
                  ].map(([n, t]) => (
                    <div key={n} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-yellow-500 text-slate-900 text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">{n}</span>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
                <BrowserBar url="https://developers.kakao.com" className="mt-3" />
              </div>

              {/* Access Token 발급 */}
              <div className="mb-5 p-4 bg-slate-800 rounded-xl border border-slate-700">
                <p className="font-semibold text-white text-sm mb-2">② Access Token 발급 (최초 1회)</p>
                <p className="text-xs text-slate-400 mb-3">REST API 키만으로는 메시지를 보낼 수 없습니다. 사용자 인증을 통해 Access Token을 받아야 합니다.</p>
                <CodeBlock label="AI VM SSH" code={`# 카카오 인증 URL 생성\npython3 << 'EOF'\nimport os\nfrom dotenv import load_dotenv\nload_dotenv('/root/crewai/.env')\n\nREST_API_KEY = os.getenv('KAKAO_ACCESS_TOKEN')\nREDIRECT_URI = 'http://localhost'\n\nauth_url = f"https://kauth.kakao.com/oauth/authorize?client_id={REST_API_KEY}&redirect_uri={REDIRECT_URI}&response_type=code"\nprint("아래 URL을 브라우저에서 열어 로그인 후 code 값을 복사하세요:")\nprint(auth_url)\nEOF`} />
                <Note type="info">브라우저에서 위 URL 접속 → 카카오 로그인 → 리디렉션된 URL의 <code>?code=</code> 뒷값을 복사합니다.</Note>
                <CodeBlock label="AI VM SSH — code 값으로 Access Token 발급" code={`python3 << 'EOF'\nimport requests, os\nfrom dotenv import load_dotenv\nload_dotenv('/root/crewai/.env')\n\nREST_API_KEY = os.getenv('KAKAO_ACCESS_TOKEN')\nCODE = input("복사한 code 값을 입력하세요: ")\n\nres = requests.post(\n    "https://kauth.kakao.com/oauth/token",\n    data={\n        "grant_type": "authorization_code",\n        "client_id": REST_API_KEY,\n        "redirect_uri": "http://localhost",\n        "code": CODE,\n    }\n)\ndata = res.json()\nprint("\\nAccess Token:", data.get('access_token'))\nprint("Refresh Token:", data.get('refresh_token'))\nEOF\n\n# 출력된 Access Token을 .env 파일의 KAKAO_ACCESS_TOKEN 값으로 업데이트`} />
              </div>

              {/* morning_brief.py */}
              <p className="text-white font-semibold text-sm mb-2">③ 모닝브리핑 에이전트 스크립트 작성</p>
              <CodeBlock label="AI VM SSH — ~/crewai/morning_brief.py 생성" code={`cat > ~/crewai/morning_brief.py << 'PYEOF'\nimport os, requests\nfrom datetime import date\nfrom dotenv import load_dotenv\nfrom crewai import Agent, Task, Crew, LLM\n\nload_dotenv('/root/crewai/.env')\n\nllm = LLM(\n    model=f"ollama/{os.getenv('OLLAMA_MODEL', 'gemma2:2b')}",\n    base_url=os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')\n)\n\n# ── 에이전트 정의 ──\nresearcher = Agent(\n    role="뉴스·날씨 리서처",\n    goal="오늘의 주요 뉴스와 서울 날씨를 수집합니다",\n    backstory="정보를 빠르게 수집하는 AI 리서처입니다",\n    llm=llm, verbose=False\n)\n\nwriter = Agent(\n    role="브리핑 작성자",\n    goal="수집된 정보를 간결한 아침 브리핑으로 작성합니다",\n    backstory="핵심만 짧게 전달하는 브리핑 전문가입니다",\n    llm=llm, verbose=False\n)\n\n# ── 태스크 정의 ──\nresearch_task = Task(\n    description=f"오늘({date.today()}) 날씨(서울)와 주요 뉴스 3가지를 한국어로 조사하세요.",\n    expected_output="날씨 정보와 뉴스 3가지 요약 (각 1-2문장)",\n    agent=researcher\n)\n\nwrite_task = Task(\n    description="조사된 내용을 카카오톡에 보낼 아침 브리핑 메시지로 작성하세요. 이모지를 활용하고 3-5줄로 간결하게 작성하세요.",\n    expected_output="카카오톡 발송용 아침 브리핑 메시지",\n    agent=writer,\n    context=[research_task]\n)\n\n# ── 실행 ──\ncrew = Crew(agents=[researcher, writer], tasks=[research_task, write_task], verbose=False)\nresult = crew.kickoff()\n\n# ── 카카오톡 나에게 보내기 ──\ntoken = os.getenv('KAKAO_ACCESS_TOKEN')\nresponse = requests.post(\n    "https://kapi.kakao.com/v2/api/talk/memo/default/send",\n    headers={"Authorization": f"Bearer {token}"},\n    data={\n        "template_object": '{"object_type":"text","text":"' + str(result).replace('"', '\\\\"') + '","link":{"web_url":"https://kakao.com"}}'\n    }\n)\nif response.status_code == 200:\n    print("✓ 카카오톡 발송 성공")\nelse:\n    print(f"✗ 발송 실패: {response.text}")\nPYEOF`} />

              <p className="text-white font-semibold text-sm mt-4 mb-2">④ 테스트 실행</p>
              <CodeBlock label="AI VM SSH" code={`cd ~/crewai && source .venv/bin/activate\npython3 morning_brief.py\n# ✓ 카카오톡 발송 성공 → 카카오톡에서 확인`} />

              <p className="text-white font-semibold text-sm mt-4 mb-2">⑤ cron으로 매일 07:00 자동 실행</p>
              <CodeBlock label="AI VM SSH" code={`# crontab 편집\ncrontab -e\n\n# 아래 줄 추가 (파일 저장 후 종료)\n0 7 * * * cd /root/crewai && /root/crewai/.venv/bin/python3 morning_brief.py >> /root/crewai/morning.log 2>&1`} />
              <CodeBlock label="AI VM SSH — 등록 확인" code={`crontab -l\n# 0 7 * * * ... 줄이 보이면 성공`} />
              <Note type="tip">로그 확인: <code>tail -f ~/crewai/morning.log</code> 로 실행 기록을 실시간으로 확인할 수 있습니다.</Note>
            </>
          ),
        },
        {
          title: '📁 문서 정리 에이전트 — NAS 파일 자동 분류',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-4">
                NAS Samba 공유 폴더를 마운트해서, 파일 이름·확장자·날짜를 분석하고 적절한 폴더로 자동 이동합니다.
                매주 1회 실행되며 분류 결과를 카카오톡으로 보고합니다.
              </p>

              <p className="text-white font-semibold text-sm mb-2">① NAS Samba 폴더 마운트</p>
              <CodeBlock label="AI VM SSH" code={`# cifs-utils 설치\nsudo apt install -y cifs-utils\n\n# 마운트 포인트 생성\nsudo mkdir -p /mnt/nas\n\n# Samba 마운트 (NAS IP와 공유 폴더명 맞춰서 수정)\nsudo mount -t cifs //${nasIP}/shared /mnt/nas \\\n  -o username=ubuntu,password=비밀번호,uid=1000,gid=1000\n\n# 마운트 확인\nls /mnt/nas`} />
              <Note type="info">재부팅 후에도 자동 마운트하려면 <code>/etc/fstab</code>에 등록하거나, 에이전트 실행 전 <code>mount</code> 명령을 스크립트에 포함하세요.</Note>

              <p className="text-white font-semibold text-sm mt-4 mb-2">② 분류 규칙 정의</p>
              <div className="overflow-x-auto mt-2 mb-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-2 pr-3 text-slate-400 font-medium">확장자 / 키워드</th>
                      <th className="text-left py-2 pr-3 text-slate-400 font-medium">분류 폴더</th>
                      <th className="text-left py-2 text-slate-400 font-medium">예시</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {[
                      { ext: '.pdf, .docx, .xlsx', folder: '문서/', ex: '계약서.pdf → 문서/' },
                      { ext: '.jpg, .png, .mp4',   folder: '미디어/', ex: '사진.jpg → 미디어/' },
                      { ext: '이름에 날짜 포함',     folder: '날짜별/', ex: '2025-06-01_회의.txt → 날짜별/' },
                      { ext: '이름에 프로젝트 키워드', folder: '프로젝트/', ex: 'homelab_설정.txt → 프로젝트/' },
                      { ext: '기타',                 folder: '기타/',   ex: 'abc.xyz → 기타/' },
                    ].map(({ ext, folder, ex }) => (
                      <tr key={folder}>
                        <td className="py-2 pr-3 text-purple-300 font-mono">{ext}</td>
                        <td className="py-2 pr-3 text-cyan-400">{folder}</td>
                        <td className="py-2 text-slate-500">{ex}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-white font-semibold text-sm mb-2">③ 문서 정리 에이전트 스크립트</p>
              <CodeBlock label="AI VM SSH — ~/crewai/doc_organizer.py 생성" code={`cat > ~/crewai/doc_organizer.py << 'PYEOF'\nimport os, shutil, requests\nfrom pathlib import Path\nfrom datetime import datetime\nfrom dotenv import load_dotenv\nfrom crewai import Agent, Task, Crew, LLM\n\nload_dotenv('/root/crewai/.env')\n\nNAS_PATH = Path("/mnt/nas")\nllm = LLM(\n    model=f"ollama/{os.getenv('OLLAMA_MODEL', 'gemma2:2b')}",\n    base_url=os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')\n)\n\n# 파일 분석 도구\ndef analyze_and_move(directory: str) -> str:\n    results = []\n    rules = [\n        (['.pdf', '.docx', '.xlsx', '.pptx', '.hwp'], '문서'),\n        (['.jpg', '.jpeg', '.png', '.gif', '.webp'], '이미지'),\n        (['.mp4', '.avi', '.mkv', '.mov'], '동영상'),\n        (['.mp3', '.wav', '.flac'], '음악'),\n        (['.zip', '.tar', '.gz', '.rar'], '압축'),\n    ]\n    src = Path(directory)\n    for f in src.iterdir():\n        if f.is_file():\n            moved = False\n            for exts, folder in rules:\n                if f.suffix.lower() in exts:\n                    dest = src / folder\n                    dest.mkdir(exist_ok=True)\n                    shutil.move(str(f), str(dest / f.name))\n                    results.append(f"✓ {f.name} → {folder}/")\n                    moved = True\n                    break\n            if not moved and f.suffix:\n                dest = src / '기타'\n                dest.mkdir(exist_ok=True)\n                shutil.move(str(f), str(dest / f.name))\n                results.append(f"• {f.name} → 기타/")\n    return "\\n".join(results) if results else "정리할 파일 없음"\n\n# ── 에이전트 실행 ──\nreport_text = analyze_and_move(str(NAS_PATH))\nsummary = f"[문서 정리 완료 - {datetime.now().strftime('%Y-%m-%d')}]\\n{report_text[:500]}"\n\n# 카카오톡 보고\ntoken = os.getenv('KAKAO_ACCESS_TOKEN')\nrequests.post(\n    "https://kapi.kakao.com/v2/api/talk/memo/default/send",\n    headers={"Authorization": f"Bearer {token}"},\n    data={\n        "template_object": '{"object_type":"text","text":"' + summary.replace('"', '\\\\"') + '","link":{"web_url":"https://kakao.com"}}'\n    }\n)\nprint(summary)\nPYEOF`} />

              <p className="text-white font-semibold text-sm mt-4 mb-2">④ 매주 일요일 02:00 자동 실행 등록</p>
              <CodeBlock label="AI VM SSH" code={`crontab -e\n\n# 아래 줄 추가\n0 2 * * 0 cd /root/crewai && /root/crewai/.venv/bin/python3 doc_organizer.py >> /root/crewai/docorg.log 2>&1`} />
            </>
          ),
        },
        {
          title: '🔍 Tailscale 오류 점검 에이전트 — Proxmox 자동 진단',
          body: () => (
            <>
              <p className="text-slate-300 text-sm mb-4">
                Proxmox에 Tailscale을 설치한 후 문제가 생기면, AI 에이전트가 SSH로 접속해서 로그를 분석하고
                오류 원인과 해결 명령어를 카카오톡으로 전송합니다.
              </p>

              {/* 동작 흐름 */}
              <div className="p-4 bg-slate-800/60 rounded-xl border border-cyan-500/30 mb-4">
                <p className="text-xs font-semibold text-cyan-300 mb-3">🔄 동작 흐름</p>
                <div className="flex flex-col gap-1.5 text-xs font-mono">
                  {[
                    { step: '1', text: 'AI VM → SSH → Proxmox 접속 (paramiko)', color: 'text-purple-300' },
                    { step: '2', text: 'tailscale status / journalctl 로그 수집', color: 'text-cyan-300' },
                    { step: '3', text: 'CrewAI analyzer가 로그 분석 → 오류 원인 파악', color: 'text-emerald-300' },
                    { step: '4', text: '해결 명령어 포함한 리포트 생성', color: 'text-amber-300' },
                    { step: '5', text: '카카오톡 나에게 보내기로 결과 전송', color: 'text-yellow-300' },
                  ].map(({ step, text, color }) => (
                    <div key={step} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-700 border border-slate-500 text-white text-xs flex items-center justify-center flex-shrink-0">{step}</span>
                      <span className={color}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-white font-semibold text-sm mb-2">① Tailscale 오류 점검 스크립트 작성</p>
              <CodeBlock label="AI VM SSH — ~/crewai/ts_checker.py 생성" code={`cat > ~/crewai/ts_checker.py << 'PYEOF'\nimport os, requests, paramiko\nfrom dotenv import load_dotenv\nfrom crewai import Agent, Task, Crew, LLM\n\nload_dotenv('/root/crewai/.env')\n\nllm = LLM(\n    model=f"ollama/{os.getenv('OLLAMA_MODEL', 'gemma2:2b')}",\n    base_url=os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')\n)\n\ndef ssh_run(host, user, password, cmd) -> str:\n    """SSH로 명령어 실행 후 결과 반환"""\n    try:\n        client = paramiko.SSHClient()\n        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())\n        client.connect(host, username=user, password=password, timeout=10)\n        _, stdout, stderr = client.exec_command(cmd)\n        result = stdout.read().decode() + stderr.read().decode()\n        client.close()\n        return result\n    except Exception as e:\n        return f"SSH 연결 실패: {e}"\n\n# ── Proxmox에서 로그 수집 ──\nPX_HOST = os.getenv('PROXMOX_HOST')\nPX_USER = os.getenv('PROXMOX_USER')\nPX_PASS = os.getenv('PROXMOX_PASSWORD')\n\nts_status = ssh_run(PX_HOST, PX_USER, PX_PASS, "tailscale status 2>&1 | head -20")\nts_log = ssh_run(PX_HOST, PX_USER, PX_PASS, "journalctl -u tailscaled -n 30 --no-pager 2>&1")\nts_service = ssh_run(PX_HOST, PX_USER, PX_PASS, "systemctl is-active tailscaled")\n\ncollected_info = f"""\n[tailscale status]\\n{ts_status}\n[tailscaled 서비스 상태]\\n{ts_service}\n[최근 로그]\\n{ts_log}\n"""\n\n# ── CrewAI 분석 ──\nanalyzer = Agent(\n    role="Tailscale 장애 분석가",\n    goal="Tailscale 로그를 분석해 오류 원인과 해결책을 제시합니다",\n    backstory="Linux 네트워킹과 VPN 전문가입니다",\n    llm=llm, verbose=False\n)\n\nanalysis_task = Task(\n    description=f"아래 Tailscale 진단 정보를 분석해 오류 원인과 해결 명령어를 한국어로 간결하게 작성하세요:\\n{collected_info}",\n    expected_output="문제 없음 또는 [오류 원인] + [해결 명령어] 형식의 한국어 리포트",\n    agent=analyzer\n)\n\ncrew = Crew(agents=[analyzer], tasks=[analysis_task], verbose=False)\nresult = crew.kickoff()\n\nreport = f"[Tailscale 점검 결과]\\n{result}"\nprint(report)\n\n# 카카오톡 발송\ntoken = os.getenv('KAKAO_ACCESS_TOKEN')\nrequests.post(\n    "https://kapi.kakao.com/v2/api/talk/memo/default/send",\n    headers={"Authorization": f"Bearer {token}"},\n    data={\n        "template_object": '{"object_type":"text","text":"' + report[:500].replace('"', '\\\\"') + '","link":{"web_url":"https://kakao.com"}}'\n    }\n)\nPYEOF`} />

              <p className="text-white font-semibold text-sm mt-4 mb-2">② 수동 실행 (Tailscale 문제 발생 시)</p>
              <CodeBlock label="AI VM SSH" code={`cd ~/crewai && source .venv/bin/activate\npython3 ts_checker.py\n# 결과가 카카오톡과 터미널에 동시 출력됩니다`} />

              <p className="text-white font-semibold text-sm mt-4 mb-2">③ 매일 자동 점검 등록 (선택)</p>
              <CodeBlock label="AI VM SSH" code={`crontab -e\n\n# 매일 06:50 (모닝브리핑 전) 자동 점검\n50 6 * * * cd /root/crewai && /root/crewai/.venv/bin/python3 ts_checker.py >> /root/crewai/ts_check.log 2>&1`} />

              {/* 자주 발생하는 오류와 자동 해결 */}
              <div className="mt-4 p-4 bg-slate-800 rounded-xl border border-slate-700">
                <p className="text-sm font-semibold text-white mb-3">에이전트가 감지하는 주요 오류 패턴</p>
                <div className="space-y-2 text-xs">
                  {[
                    { log: 'ip_forwarding not enabled', fix: 'sysctl -w net.ipv4.ip_forward=1 && echo net.ipv4.ip_forward=1 >> /etc/sysctl.conf' },
                    { log: 'failed to bring interface up', fix: 'systemctl restart tailscaled && tailscale up' },
                    { log: 'Login expired', fix: 'tailscale up --reset' },
                    { log: 'inactive (dead)', fix: 'systemctl enable --now tailscaled' },
                    { log: 'subnet router not approved', fix: 'admin.tailscale.com → 해당 기기 → Edit route settings 승인' },
                  ].map(({ log, fix }) => (
                    <div key={log} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-red-400 font-mono">로그: {log}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 text-xs">→ 해결: </span>
                        <code className="text-cyan-400 text-xs">{fix}</code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Note type="easy">처음에는 수동 실행으로 테스트하고, 정상 동작 확인 후 cron에 등록하는 것이 좋습니다.</Note>
            </>
          ),
        },
      ],
    },

    /* ══════════════════════════════════════ STEP 4 Windows */
    {
      id: 5, title: 'VM3 · Windows 11', subtitle: '개발 & 인터넷 작업용', icon: '💻', color: 'from-cyan-600 to-blue-600',
      sections: [
        {
          title: 'VM 생성 설정 (VM ID: 102)',
          body: () => (
            <>
              <StepSummary
                goal="Windows 11 가상컴퓨터를 만들어 개발·인터넷 작업용으로 사용합니다"
                time="약 1시간"
                difficulty="보통"
                items={[
                  'Windows 11 VM 생성 (TPM·UEFI 설정 포함)',
                  'VirtIO 드라이버 추가 (성능 향상 필수)',
                  'Windows 11 설치 후 원격 데스크탑(RDP) 활성화',
                ]}
                result={`스마트폰·다른 PC에서 ${winIP} 로 Windows 화면을 원격 조작 가능`}
              />
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
      id: 6, title: '야간 절전 모드', subtitle: '23:00 자동 종료 → 08:00 자동 부팅', icon: '🌙', color: 'from-indigo-600 to-slate-700',
      sections: [
        {
          title: '야간 절전 스케줄 개요',
          body: () => (
            <>
              <StepSummary
                goal="매일 밤 23시에 자동으로 꺼지고 아침 8시에 자동으로 켜지도록 설정합니다"
                time="20~30분"
                difficulty="보통"
                items={[
                  '바이오스(BIOS)에서 RTC 알람 기능 활성화',
                  '야간 종료 스크립트 작성 (명령어 복사·붙여넣기)',
                  'cron으로 매일 23시 자동 실행 등록',
                ]}
                result="손대지 않아도 매일 밤 자동으로 절전, 아침에 자동 부팅되어 전기요금 절감"
              />
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
      id: 7, title: 'RAM 업그레이드', subtitle: '32GB 장착 후 VM 설정 변경', icon: '⬆️', color: 'from-emerald-500 to-teal-600',
      sections: [
        {
          title: '준비 사항',
          body: () => (
            <>
              <StepSummary
                goal="RAM을 8GB → 32GB로 교체하고 각 VM의 메모리·CPU 배분을 늘립니다"
                time="30분 (하드웨어) + 10분 (설정)"
                difficulty="쉬움"
                items={[
                  'PC 전원 완전히 끄기',
                  '기존 8GB RAM 제거 후 32GB 장착',
                  'Proxmox 재부팅 후 32GB 인식 확인',
                  '각 VM에 메모리·CPU 추가 배분 (명령어 복사·붙여넣기)',
                ]}
                result="AI VM에 20GB 메모리 확보 → Gemma2 9B(고성능 모델) 동작, Windows와 동시 구동 가능"
              />
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
                <p className="text-sm font-semibold text-purple-300 mb-2">🤖 CrewAI 에이전트 모델 변경</p>
                <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
                  <li><code className="text-cyan-400 bg-slate-800 px-1 rounded">~/crewai/.env</code> 파일 열기</li>
                  <li><code className="text-purple-300">OLLAMA_MODEL=gemma2:2b</code> → <code className="text-emerald-300">OLLAMA_MODEL=gemma2</code> 로 변경</li>
                  <li>저장 후 에이전트 재실행 → 성능 향상 즉시 체감!</li>
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

    /* ══════════════════════════════════════ STEP 8 접속 정보 요약 */
    {
      id: 8, title: '접속 정보 요약', subtitle: '내 홈랩 주소 · 계정 · SSH 한눈에 보기', icon: '📋', color: 'from-slate-500 to-slate-700',
      sections: [
        {
          title: '내 홈랩 접속 정보 모음',
          body: () => (
            <>
              <StepSummary
                goal="언제든 빠르게 참고할 수 있는 접속 정보를 한 장으로 정리합니다"
                time="참고용"
                difficulty="쉬움"
                items={[
                  'Proxmox 웹 GUI 주소 (집 안 / Tailscale)',
                  'Ubuntu VM 사용자 계정 및 SSH 접속 명령어',
                  '각 화면별 언제 어떤 정보를 쓰는지 정리',
                ]}
                result="어디서든 이 페이지만 열면 모든 접속 정보 즉시 확인"
              />

              {/* Proxmox 인프라 정보 */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">⚙️</span>
                  <p className="font-semibold text-white text-sm">Proxmox 및 인프라 정보</p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { label: 'Proxmox 웹 GUI (집 안 내부 IP)', value: `https://${pxIP}:8006`, type: 'url' },
                    { label: 'Proxmox 웹 GUI (Tailscale 외부 접속)', value: 'https://100.100.208.66:8006', type: 'url' },
                    { label: '현재 VM ID', value: '100 (ubuntu-server-2404)', type: 'text' },
                  ].map(({ label, value, type }) => (
                    <div key={label} className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                      <div className="text-xs text-slate-500 mb-1">{label}</div>
                      {type === 'url'
                        ? <BrowserBar url={value} />
                        : <div className="font-mono text-cyan-400 text-sm">{value}</div>}
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 rounded-xl bg-blue-900/20 border border-blue-500/30 text-xs text-slate-300">
                  <span className="text-blue-300 font-semibold">💡 </span>
                  <code className="text-cyan-400">100.100.208.66</code> 은 Proxmox 호스트 본체가 할당받은 <strong className="text-white">Tailscale IP</strong>입니다.
                  집 밖에서 접속할 때는 스마트폰·노트북에 Tailscale 앱을 켜고 이 주소를 사용합니다.
                </div>
              </div>

              {/* Ubuntu VM 정보 */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">🗄️</span>
                  <p className="font-semibold text-white text-sm">우분투 가상 머신 (VM) 정보</p>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    ['사용자 계정 (ID)', 'ares'],
                    ['호스트 이름 (Hostname)', 'pve-nas'],
                    ['내부 네트워크 IP (LAN)', '192.168.200.129'],
                    ['VM 관리 ID', 'VMID 100'],
                  ].map(([k, v]) => (
                    <div key={k as string} className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                      <div className="text-xs text-slate-500 mb-1">{k}</div>
                      <div className="font-mono text-emerald-400 text-sm">{v}</div>
                    </div>
                  ))}
                </div>

                <p className="text-white font-semibold text-sm mb-2">SSH 접속 명령어 (PC 터미널)</p>
                <CodeBlock label="내 PC — Windows PowerShell / macOS 터미널" code={`ssh ares@192.168.200.129`} />

                <div className="mt-3 p-4 bg-amber-900/15 rounded-xl border border-amber-500/30 text-xs text-slate-300 space-y-2">
                  <p className="text-amber-200 font-semibold">📌 ares 계정이란?</p>
                  <p>우분투 설치 과정에서 직접 생성한 <strong className="text-white">주 관리용 일반 계정</strong>입니다.</p>
                  <p>리눅스 보안 권장 사항에 따라 최고 관리자(<code className="text-cyan-400">root</code>)로 직접 로그인하는 대신,
                    <code className="text-emerald-400 mx-1">ares</code> 계정으로 로그인해서 작업합니다.</p>
                  <p>시스템 설정이나 패키지 설치 등 관리자 권한이 필요할 때는 명령어 앞에
                    <code className="text-amber-300 mx-1">sudo</code>를 붙여 안전하게 실행합니다.</p>
                  <div className="mt-2 p-2 rounded-lg bg-slate-900/60 border border-slate-700 font-mono">
                    <span className="text-slate-500"># 예시 — 일반 명령</span><br/>
                    <span className="text-emerald-400">ares@pve-nas:~$</span> <span className="text-white">ls /home</span><br/><br/>
                    <span className="text-slate-500"># 예시 — 관리자 권한 필요 시</span><br/>
                    <span className="text-emerald-400">ares@pve-nas:~$</span> <span className="text-amber-300">sudo</span> <span className="text-white">apt update</span>
                  </div>
                </div>
              </div>

              {/* 접속 시나리오 요약 */}
              <div className="mb-2">
                <p className="font-semibold text-white text-sm mb-3">💡 상황별 접속 방법 요약</p>
                <div className="space-y-3">
                  {[
                    {
                      situation: 'Proxmox 웹 대시보드 접속',
                      icon: '⚙️',
                      color: 'border-orange-500/40 bg-orange-900/10',
                      badge: 'bg-orange-500/20 text-orange-300',
                      steps: [
                        '브라우저 주소창에 https://100.100.208.66:8006 입력 (Tailscale 켜진 상태)',
                        `또는 같은 Wi-Fi 안에 있을 때: https://${pxIP}:8006`,
                        '로그인: 사용자명 root / 설치 시 설정한 비밀번호',
                      ],
                    },
                    {
                      situation: '우분투 서버 내부 설정 (SSH)',
                      icon: '🗄️',
                      color: 'border-emerald-500/40 bg-emerald-900/10',
                      badge: 'bg-emerald-500/20 text-emerald-300',
                      steps: [
                        'PC 터미널에서: ssh ares@192.168.200.129',
                        '로그인: ID → ares / 비밀번호 → 설치 시 설정한 값',
                        '관리자 작업 시 sudo 붙이기 (예: sudo apt update)',
                      ],
                    },
                    {
                      situation: '우분투 서버 내부 설정 (Proxmox 콘솔)',
                      icon: '🖥️',
                      color: 'border-blue-500/40 bg-blue-900/10',
                      badge: 'bg-blue-500/20 text-blue-300',
                      steps: [
                        'Proxmox 웹 UI → 왼쪽 트리에서 VMID 100 클릭',
                        '상단 Console 탭 클릭 → 웹 브라우저 안에 터미널 창 열림',
                        '로그인: ID → ares / 비밀번호 입력',
                      ],
                    },
                  ].map(({ situation, icon, color, badge, steps }) => (
                    <div key={situation} className={`p-4 rounded-xl border ${color}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-base">{icon}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge}`}>{situation}</span>
                      </div>
                      <ol className="space-y-1.5">
                        {steps.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                            <span className="w-4 h-4 rounded-full bg-slate-700 text-slate-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ),
        },
      ],
    },
  ];

  const step = STEPS[activeStep] ?? STEPS[0];

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
                { name: 'VM1 · NAS 서버',   icon: '🗄️', color: 'border-blue-500/60',   badge: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',     cpu: '2 vCPU', ram: '2 GB',  disk: '60GB M.2 + 1TB HDD', sw: 'Ubuntu + Portainer + Jellyfin' },
                { name: 'VM2 · AI 에이전트', icon: '🤖', color: 'border-purple-500/60', badge: 'bg-purple-500/15 text-purple-300 border border-purple-500/30', cpu: '4 vCPU', ram: '4 GB',  disk: '350GB M.2',          sw: 'Ollama(gemma2:2b) + Dify'       },
                { name: 'VM3 · Windows 11', icon: '💻', color: 'border-slate-500/60',   badge: 'bg-slate-600/40 text-slate-400 border border-slate-500/30',   cpu: '2 vCPU', ram: '2 GB',  disk: '100GB M.2',          sw: '⚠ 사용 시에만 켜기 권장'         },
                { name: 'Proxmox 호스트',   icon: '⚙️', color: 'border-slate-600',      badge: 'bg-slate-700/40 text-slate-400 border border-slate-600',      cpu: '공유',   ram: '~512 MB', disk: '2GB M.2 (시스템)', sw: 'Proxmox VE 8.x 하이퍼바이저'   },
              ] : [
                { name: 'VM1 · NAS 서버',   icon: '🗄️', color: 'border-blue-500/60',   badge: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',     cpu: '2 vCPU', ram: '4 GB',  disk: '60GB M.2 + 1TB HDD', sw: 'Ubuntu + Portainer + Jellyfin' },
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
              <div className="hidden md:block text-left">
                <div className="leading-tight">{s.title}</div>
                <div className={`text-xs leading-tight ${activeStep === s.id ? 'text-white/60' : 'text-slate-600'}`}>{s.subtitle}</div>
              </div>
              <span className="md:hidden text-xs">{s.id + 1}단계</span>
            </button>
          ))}
        </div>

        {/* ── Step Content ── */}
        <div id="print-area" className="bg-slate-900/70 rounded-2xl border border-slate-700 overflow-hidden mb-8">
          <div className={`p-5 bg-gradient-to-r ${step.color} flex items-center gap-3`}>
            <span className="text-3xl">{step.icon}</span>
            <div className="flex-1">
              <div className="text-white font-black text-lg leading-tight">{step.title}</div>
              <div className="text-white/65 text-sm">{step.subtitle}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  // 모든 섹션 펼치기 후 출력
                  setOpenSections(new Set(step.sections.map((_, i) => i)));
                  setTimeout(() => window.print(), 300);
                }}
                className="no-print flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-all border border-white/20 backdrop-blur-sm"
                title="현재 단계 내용을 PDF로 저장"
              >
                <span>🖨️</span>
                <span className="hidden sm:inline">PDF 출력</span>
              </button>
              <div className="text-white/40 text-sm font-mono">{activeStep + 1} / {STEPS.length}</div>
            </div>
          </div>
          <div className="p-4 md:p-6 space-y-2">
            {step.sections.map((sec, i) => {
              const Body = sec.body;
              const isOpen = openSections.has(i);
              const isFirst = i === 0;
              return (
                <div key={i} className={`rounded-xl overflow-hidden border ${isOpen ? 'border-slate-600' : 'border-slate-700/60'}`}>
                  <button
                    className={`section-title-row w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors ${isOpen ? 'bg-slate-700/60' : 'bg-slate-800/80 hover:bg-slate-800'}`}
                    onClick={() => toggleSection(i)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isOpen ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-400'}`}>{i + 1}</span>
                      <span className={`font-semibold text-sm truncate ${isOpen ? 'text-white' : 'text-slate-300'}`}>{sec.title}</span>
                      {isFirst && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex-shrink-0 hidden sm:inline">여기서 시작</span>}
                    </div>
                    <span className={`no-print text-slate-400 text-xs transition-transform duration-200 flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  <div className={`print-section-body p-5 bg-slate-900/50 ${isOpen ? 'block' : 'hidden'}`}>
                    <Body />
                  </div>
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
                  ['🐳 Portainer (NAS)',   `http://${nasIP}:9000`,    'Docker 컨테이너 관리 대시보드'],
                  ['🎬 Jellyfin 스트리밍', `http://${nasIP}:8096`,    '미디어 서버 (Google TV·모바일)'],
                  ['📸 Immich 사진 관리',  `http://${nasIP}:2283`,    'Google 포토 대체 사진·영상 백업'],
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
          <p>Proxmox VE · Ubuntu Server · Portainer · Jellyfin · Immich · Samba · Docker · Ollama · CrewAI</p>
        </div>
      </div>
    </div>
  );
}
