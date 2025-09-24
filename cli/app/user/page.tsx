'use client'
import React, { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import api from '@/lib/fetcher'
import { useRouter } from 'next/navigation'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

export default function page() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const formSchema = z.object({
        name: z.string().min(2, { message: "Name must be at least 2 characters long" }).max(50),
        username: z.string().min(5, { message: "Username must be at least 5 characters long" }).max(50),
        password: z.string().min(6).optional()
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            username: '',
            password: ''
        },
    })
    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {

            const result = await api.post('/api/auth/register', data)
            if (result.status == 200 || result.status == 201) {
                router.replace('/login')
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className='w-screen h-screen p-4 flex flex-col items-center justify-center'>
            <h1>user page</h1>
            <Card className='p-6 w-full'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem >
                                    <FormLabel>username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="enter your username" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Please enter a username 
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="enter your name" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Please enter a name
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>password</FormLabel>
                                    <FormControl>
                                        <div className='relative'>

                                        <Input type={showPassword ? "text" : "password"}  placeholder="enter your password" {...field} />
                                        <Button
                                            type="button"
                                            variant="link"
                                            size="sm"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-0"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                        </Button>

                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        Please enter a password
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Submit</Button>
                    </form>
                </Form>

                <div className=' text-end'>

                <Button onClick={()=>router.replace('/login')}>login</Button>
                </div>
            </Card>

        </div>
    )

}

