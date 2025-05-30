import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    // Get the authenticated user's ID from Clerk
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get the complete user object from Clerk
  const client = await clerkClient()
  const user = await client.users.getUser(userId)
    
    // Check if user already exists in our database
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (existingUser) {
      // User already exists, return the existing user
      return NextResponse.json({ 
        user: existingUser,
        created: false
      })
    }
    
    // User doesn't exist, create a new user record
    const newUser = await prisma.user.create({
      data: {
        id: userId,
        email: user.emailAddresses[0]?.emailAddress,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
      }
    })
    
    return NextResponse.json({ 
      user: newUser,
      created: true
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
