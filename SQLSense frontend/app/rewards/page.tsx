"use client"

import { motion } from "framer-motion"
import { Trophy, Star, Zap, Target, Gift, Crown, Medal, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/lib/store"

const badges = [
  { name: "Bronze Explorer", icon: Medal, requirement: 50, color: "from-amber-600 to-amber-800" },
  { name: "Silver Analyst", icon: Award, requirement: 100, color: "from-gray-400 to-gray-600" },
  { name: "Gold Master", icon: Crown, requirement: 200, color: "from-yellow-400 to-yellow-600" },
  { name: "Platinum Legend", icon: Trophy, requirement: 500, color: "from-purple-400 to-purple-600" },
]

const rewards = [
  { name: "CSV Export", cost: 10, description: "Export query results as CSV" },
  { name: "JSON Export", cost: 15, description: "Export schema as JSON" },
  { name: "Premium Templates", cost: 25, description: "Access to premium schema templates" },
  { name: "Advanced Analytics", cost: 50, description: "Detailed query performance insights" },
]

export default function Rewards() {
  const { user, spendTokens, addBadge } = useAppStore()
  const { toast } = useToast()

  if (!user) return null

  const handlePurchase = (reward: any) => {
    if (spendTokens(reward.cost)) {
      toast({
        title: "Purchase Successful!",
        description: `You've unlocked ${reward.name}`,
      })
    } else {
      toast({
        title: "Insufficient Tokens",
        description: `You need ${reward.cost} tokens for this reward`,
        variant: "destructive",
      })
    }
  }

  const getNextBadge = () => {
    return badges.find((badge) => !user.badges.includes(badge.name))
  }

  const nextBadge = getNextBadge()
  const progressToNext = nextBadge ? (user.queriesCount / nextBadge.requirement) * 100 : 100

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Rewards & Achievements</h1>
          <p className="text-gray-600 dark:text-gray-300">Track your progress and unlock exciting rewards</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Overview */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Your Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{user.tokens}</div>
                  <div className="text-sm text-gray-500">Tokens Available</div>
                </div>

                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{user.queriesCount}</div>
                    <div className="text-sm text-gray-500">Queries Generated</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold">{user.schemasCount}</div>
                    <div className="text-sm text-gray-500">Schemas Created</div>
                  </div>
                </div>

                {nextBadge && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress to {nextBadge.name}</span>
                      <span>
                        {user.queriesCount}/{nextBadge.requirement}
                      </span>
                    </div>
                    <Progress value={progressToNext} className="h-2" />
                    <p className="text-xs text-gray-500 text-center">
                      {nextBadge.requirement - user.queriesCount} queries to go!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Your Badges</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {badges.map((badge) => {
                    const earned = user.badges.includes(badge.name)
                    const Icon = badge.icon
                    return (
                      <motion.div
                        key={badge.name}
                        whileHover={{ scale: earned ? 1.05 : 1 }}
                        className={`p-3 rounded-lg text-center ${
                          earned
                            ? `bg-gradient-to-r ${badge.color} text-white shadow-lg`
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                        }`}
                      >
                        <Icon className="w-6 h-6 mx-auto mb-1" />
                        <div className="text-xs font-medium">{badge.name}</div>
                        {!earned && <div className="text-xs opacity-70">{badge.requirement} queries</div>}
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Rewards Store */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gift className="w-5 h-5" />
                  <span>Token Store</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rewards.map((reward, index) => (
                    <motion.div
                      key={reward.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold">{reward.name}</h3>
                        <Badge variant="secondary">{reward.cost} tokens</Badge>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{reward.description}</p>

                      <Button
                        onClick={() => handlePurchase(reward)}
                        disabled={user.tokens < reward.cost}
                        className="w-full"
                        variant={user.tokens >= reward.cost ? "default" : "outline"}
                      >
                        {user.tokens >= reward.cost ? "Purchase" : "Insufficient Tokens"}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievement Progress */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Achievement Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {badges.map((badge) => {
                    const earned = user.badges.includes(badge.name)
                    const progress = Math.min((user.queriesCount / badge.requirement) * 100, 100)
                    const Icon = badge.icon

                    return (
                      <div key={badge.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Icon className={`w-5 h-5 ${earned ? "text-yellow-500" : "text-gray-400"}`} />
                            <span className="font-medium">{badge.name}</span>
                            {earned && <Star className="w-4 h-4 text-yellow-500" />}
                          </div>
                          <span className="text-sm text-gray-500">
                            {user.queriesCount}/{badge.requirement}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
