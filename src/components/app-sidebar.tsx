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
import { Bot, Home, LineChart, Users } from 'lucide-react';
import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation'; // Import Next.js navigation hooks

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
    } else if (pathname === '/referrals') {
         setActiveItem('referrals');
    } else {
      // Optional: handle other paths or set a default
      setActiveItem(''); // Or keep the last known active item
    }
  }, [pathname]);


  const handleItemClick = (item: string, path: string) => {
    // setActiveItem(item); // No longer needed, useEffect handles this
    router.push(path); // Navigate using Next.js router
    console.log(`Navigate to ${item} at ${path}`);
  };

  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon">
      <SidebarHeader className="flex items-center justify-between p-2">
         <div className="flex items-center gap-2">
          <HibllxLogo />
          <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">HIBLLX</span>
         </div>
        {/* SidebarTrigger is usually outside the Sidebar content in the main layout,
            but placing it here conditionally for mobile might be an option too.
            The current setup assumes the trigger is in the header of the main content area.
            Let's keep this clean for now. */}
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleItemClick('dashboard', '/')}
              isActive={activeItem === 'dashboard'}
              tooltip="Dashboard"
            >
              <Home />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleItemClick('bill-x', '/bill-x')}
              isActive={activeItem === 'bill-x'}
              tooltip="Bill X AI"
            >
              <Bot />
              <span>Bill X</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
               onClick={() => handleItemClick('performance', '/performance')}
              isActive={activeItem === 'performance'}
              tooltip="Performance"
              // Removed disabled prop
            >
              <LineChart />
              <span>Performance</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
             <SidebarMenuButton
               onClick={() => handleItemClick('referrals', '/referrals')} // Assuming a /referrals route
              isActive={activeItem === 'referrals'}
              tooltip="Referrals"
               disabled // Disable temporarily if page not ready
            >
              <Users />
              <span>Referrals</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      {/* SidebarFooter can be added here if needed */}
    </Sidebar>
  );
}
