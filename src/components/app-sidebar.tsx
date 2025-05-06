
// @ts-nocheck
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Bot, Home, LineChart, Users, Landmark } from 'lucide-react'; // Added Landmark for Treasury/Gov icon
import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Simple inline SVG for HIBLLX logo (replace with actual logo if available)
const HibllxLogo = () => (
  <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 80 L50 20 L80 80 Z" stroke="hsl(var(--primary))" strokeWidth="10" fill="none"/>
    <path d="M35 60 H65" stroke="hsl(var(--accent))" strokeWidth="8"/>
  </svg>
);


export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeItem, setActiveItem] = React.useState('dashboard');

  // Update active item based on current route
  useEffect(() => {
    if (pathname === '/') {
      setActiveItem('dashboard');
    } else if (pathname === '/bill-x') {
      setActiveItem('bill-x');
    } else if (pathname === '/performance') {
       setActiveItem('performance');
    } else if (pathname === '/referrals') { // Kept for potential future use, but adjust relevance
         setActiveItem('referrals');
    } else {
      setActiveItem('');
    }
  }, [pathname]);


  const handleItemClick = (item: string, path: string) => {
    router.push(path);
    console.log(`Navigate to ${item} at ${path}`);
  };

  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon">
      <SidebarHeader className="flex items-center justify-between p-2">
         <div className="flex items-center gap-2">
          <HibllxLogo />
          <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">HIBLLX GovAI</span>
         </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleItemClick('dashboard', '/')}
              isActive={activeItem === 'dashboard'}
              tooltip="Trading Dashboard"
            >
              <Home />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleItemClick('bill-x', '/bill-x')}
              isActive={activeItem === 'bill-x'}
              tooltip="Bill X AI Agent"
            >
              <Bot />
              <span>Bill X</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
               onClick={() => handleItemClick('performance', '/performance')}
              isActive={activeItem === 'performance'}
              tooltip="AI Performance Monitor"
            >
              <LineChart />
              <span>Performance</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* Example: Replace Referrals with something more relevant like Treasury/Compliance */}
           <SidebarMenuItem>
             <SidebarMenuButton
               onClick={() => handleItemClick('treasury', '/treasury')} // Example route
              isActive={activeItem === 'treasury'}
              tooltip="Treasury Operations"
               disabled // Disable temporarily if page not ready
            >
              <Landmark />
              <span>Treasury</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      {/* SidebarFooter can be added here if needed */}
    </Sidebar>
  );
}
