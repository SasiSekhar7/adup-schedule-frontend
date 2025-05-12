import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const [email, setEmail] = useState<string>();
    const [password, setPassword] = useState<string>();
    const navigate  = useNavigate();
    async function handleLogin(e){
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json" // Ensure the server knows it's JSON
                },
                body: JSON.stringify({ email, password }) // Convert object to JSON string
            });
            if (!response.ok) {
                throw new Error("Login failed");
            }
            
            const data = await response.json(); // Parse JSON response
            const token = data.token; // Extract token

            sessionStorage.setItem('token', token)
            navigate('/')
            
        } catch (error) {
            console.log(error)
        }
    }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email} onChange={(e)=>setEmail(e.target.value)} 
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" value={password} onChange={(e)=>setPassword(e.target.value)} type="password" required />
              </div>
              <Button type="submit" className="w-full" onClick={(e)=>handleLogin(e)}>
                Login
              </Button>
     
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}
