"use client"
import { useAuth } from '@/hooks/useAuth'
import React from 'react'
import { useRouter } from 'next/navigation';
export default function page() {
  const {token,user} = useAuth();
  const router = useRouter();
  return (
      <>
      {
       token?router.replace('/chats'):router.replace('/login')
           

      }
       </> 
  )
}
