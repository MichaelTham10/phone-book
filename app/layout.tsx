'use client'
import './globals.css'
import { Inter } from 'next/font/google'
import { css } from '@emotion/react'
import { Colors } from '@/colors/colors'
import ApolloContext from '@/contexts/ApolloContext'

const inter = Inter({ subsets: ['latin'] })

const flexed = css({
  flex: 1,
  backgroundColor: Colors.grayBackground,
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ApolloContext>
      <html lang="en">
        <body css={flexed} className={inter.className}>
          {children}
        </body>
      </html>
    </ApolloContext>
  )
}
