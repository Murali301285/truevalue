
import { ProfileForm } from "@/components/profile/profile-form"

export default function ProfilePage() {
    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="border-b border-zinc-200 pb-5">
                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Your Profile</h1>
                <p className="text-zinc-500">Manage your account settings and preferences.</p>
            </div>

            <ProfileForm />
        </div>
    )
}
