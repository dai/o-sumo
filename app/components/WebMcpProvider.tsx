import { useEffect } from 'react';
import { registerWebMcpTools, WEBMCP_TOOLS } from '../lib/webmcp';

interface WebMcpProviderProps {
  children?: React.ReactNode;
}

export default function WebMcpProvider({ children }: WebMcpProviderProps) {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    registerWebMcpTools();
  }, []);

  return <>{children}</>;
}

export { WEBMCP_TOOLS };