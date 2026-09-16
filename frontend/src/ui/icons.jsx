function Svg({ children, ...props }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export function EyeIcon(props) {
  return (
    <Svg {...props}>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  );
}

export function PencilIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
    </Svg>
  );
}

export function TrashIcon(props) {
  return (
    <Svg {...props}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </Svg>
  );
}

export function PlusIcon(props) {
  return (
    <Svg {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </Svg>
  );
}

export function UploadIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 3v12" />
      <polyline points="8 7 12 3 16 7" />
      <path d="M4 15v4a2 2 0 002 2h12a2 2 0 002-2v-4" />
    </Svg>
  );
}

export function ClipboardIcon(props) {
  return (
    <Svg {...props}>
      <rect x="6" y="3" width="12" height="18" rx="1.5" />
      <rect x="9" y="1.5" width="6" height="3" rx="1" />
      <line x1="9" y1="9" x2="15" y2="9" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="12" y2="17" />
    </Svg>
  );
}

export function CheckCircleIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <polyline points="8 12.5 11 15.5 16 9" />
    </Svg>
  );
}

export function ClockIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14" />
    </Svg>
  );
}

export function CashIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="7" x2="12" y2="17" />
      <path d="M15 9.5c0-1.1-1.3-2-3-2s-3 .9-3 2c0 1.1 1.3 1.6 3 2s3 .9 3 2c0 1.1-1.3 2-3 2s-3-.9-3-2" />
    </Svg>
  );
}

export function ReceiptIcon(props) {
  return (
    <Svg {...props}>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="9" y1="12" x2="15" y2="12" />
    </Svg>
  );
}

export function ScaleIcon(props) {
  return (
    <Svg {...props}>
      <line x1="12" y1="3" x2="12" y2="21" />
      <path d="M6 7h12" />
      <path d="M3 7l3-4 3 4-3 4z" />
      <path d="M15 7l3-4 3 4-3 4z" />
      <path d="M7 21h10" />
    </Svg>
  );
}

export function BikeIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="6" cy="17" r="3" />
      <circle cx="18" cy="17" r="3" />
      <path d="M6 17l4-8h5l3 5" />
      <path d="M10 9h4" />
    </Svg>
  );
}
