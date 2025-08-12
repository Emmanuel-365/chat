"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createInvitation } from "@/lib/invitations";
import { useAuth } from "@/hooks/use-auth";
import type { UserRole, StudentProfile } from "@/types/user";

import { AuthGuard } from "@/components/auth/auth-guard";

export default function InvitationsPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [studentProfile, setStudentProfile] = useState<StudentProfile>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!user) {
      setError("You must be logged in to create an invitation.");
      setLoading(false);
      return;
    }

    try {
      const { success } = await createInvitation(
        email,
        role,
        user.uid,
        role === "student" ? studentProfile : undefined
      );

      if (success) {
        setSuccess(`Invitation sent to ${email}`);
        setEmail("");
        setStudentProfile({});
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStudentProfileChange = (field: keyof StudentProfile, value: string) => {
    setStudentProfile((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AuthGuard requiredRole="admin">
      <div className="p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Create Invitation</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {role === "student" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="classId">Class ID</Label>
                    <Input
                      id="classId"
                      type="text"
                      placeholder="Enter class ID"
                      value={studentProfile.classId || ""}
                      onChange={(e) =>
                        handleStudentProfileChange("classId", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="className">Class Name</Label>
                    <Input
                      id="className"
                      type="text"
                      placeholder="Enter class name"
                      value={studentProfile.className || ""}
                      onChange={(e) =>
                        handleStudentProfileChange("className", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade</Label>
                    <Input
                      id="grade"
                      type="text"
                      placeholder="Enter grade"
                      value={studentProfile.grade || ""}
                      onChange={(e) =>
                        handleStudentProfileChange("grade", e.target.value)
                      }
                    />
                  </div>
                </>
              )}
              {error && <p className="text-red-500">{error}</p>}
              {success && <p className="text-green-500">{success}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Invitation"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}