export interface VMIPs {
  nasIP: string;
  aiIP: string;
  winIP: string;
}

export function deriveVMIPs(proxmoxIP: string): VMIPs {
  const parts = proxmoxIP.trim().split('.');
  if (parts.length !== 4) {
    return { nasIP: 'x.x.x.201', aiIP: 'x.x.x.202', winIP: 'x.x.x.203' };
  }
  const base = parts.slice(0, 3).join('.');
  const last = parseInt(parts[3]) || 200;
  return {
    nasIP: `${base}.${last + 1}`,
    aiIP:  `${base}.${last + 2}`,
    winIP: `${base}.${last + 3}`,
  };
}
