export default function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      background: '#ffffff',
      zIndex: 9999,
      overflow: 'auto'
    }}>
      {children}
    </div>
  );
}