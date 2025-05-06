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
import React from 'react';

// Simple inline SVG for HIBLLX logo (replace with actual logo if available)
const HibllxLogo = () => (
  <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 80 L50 20 L80 80 Z" stroke="hsl(var(--primary))" strokeWidth="10" fill="none"/>
    <path d="M35 60 H65" stroke="hsl(var(--accent))" strokeWidth="8"/>
  </svg>
);


export default function AppSidebar() {
  // In a real app, you'd use routing (like next/link or next/navigation)
  // and manage active state based on the current route.
  const [activeItem, setActiveItem] = React.useState('dashboard');

  const handleItemClick = (item: string) => {
    setActiveItem(item);
    // Add navigation logic here
    console.log(`Navigate to ${item}`);
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
              onClick={() => handleItemClick('dashboard')}
              isActive={activeItem === 'dashboard'}
              tooltip="Dashboard"
            >
              <Home />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleItemClick('ai-agent')}
              isActive={activeItem === 'ai-agent'}
              tooltip="AI Agent"
            >
              <Bot />
              <span>AI Agent</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleItemClick('performance')}
              isActive={activeItem === 'performance'}
              tooltip="Performance"
            >
              <LineChart />
              <span>Performance</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleItemClick('referrals')}
              isActive={activeItem === 'referrals'}
              tooltip="Referrals"
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
