import { motion } from "framer-motion";
import { CheckCircle2, Clock, ListTodo, TrendingUp, AlertCircle, Zap, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { apiService, TaskStats } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const Dashboard = () => {
  const { user } = useAuth();

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["taskStats"],
    queryFn: () => {
      console.log('Dashboard: Fetching stats with token:', apiService.getToken()?.substring(0, 20) + '...');
      return apiService.getTaskStats();
    },
    retry: 1,
  });

  const {
    data: tasks,
    isLoading: tasksLoading,
    error: tasksError,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => {
      console.log('Dashboard: Fetching tasks with token:', apiService.getToken()?.substring(0, 20) + '...');
      return apiService.getTasks();
    },
    retry: 1,
  });

  if (statsError || tasksError) {
    toast.error("Failed to load dashboard data");
  }

  const getStatsData = () => {
    if (!stats) return [];
    
    const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    
    return [
      {
        title: "Total Tasks",
        value: stats.total.toString(),
        change: stats.total > 0 ? "+12%" : "0%",
        icon: ListTodo,
        color: "text-primary",
        bgColor: "bg-primary/10",
      },
      {
        title: "Completed",
        value: stats.completed.toString(),
        change: "+8%",
        icon: CheckCircle2,
        color: "text-success",
        bgColor: "bg-success/10",
      },
      {
        title: "In Progress",
        value: (stats.total - stats.completed).toString(),
        change: "+2",
        icon: Clock,
        color: "text-warning",
        bgColor: "bg-warning/10",
      },
      {
        title: "Completion Rate",
        value: `${completionRate}%`,
        change: completionRate > 70 ? "+5%" : "-2%",
        icon: TrendingUp,
        color: completionRate > 70 ? "text-success" : "text-warning",
        bgColor: completionRate > 70 ? "bg-success/10" : "bg-warning/10",
      },
    ];
  };

  const getPriorityData = () => {
    if (!stats) return [];
    
    const total = stats.total;
    return [
      { 
        name: "High Priority", 
        count: stats.byPriority.High || 0, 
        progress: total > 0 ? Math.round(((stats.byPriority.High || 0) / total) * 100) : 0, 
        color: "bg-destructive" 
      },
      { 
        name: "Medium Priority", 
        count: stats.byPriority.Medium || 0, 
        progress: total > 0 ? Math.round(((stats.byPriority.Medium || 0) / total) * 100) : 0, 
        color: "bg-warning" 
      },
      { 
        name: "Low Priority", 
        count: stats.byPriority.Low || 0, 
        progress: total > 0 ? Math.round(((stats.byPriority.Low || 0) / total) * 100) : 0, 
        color: "bg-success" 
      },
    ];
  };

  const statsData = getStatsData();
  const priorities = getPriorityData();
  const completionRate = stats?.total ? Math.round((stats.completed / stats.total) * 100) : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  if (statsLoading || tasksLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Track your productivity and manage your tasks
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {statsData.map((stat, index) => (
            <motion.div key={stat.title} variants={itemVariants}>
              <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <div
                      className={`text-sm font-medium ${
                        stat.change.startsWith("+") ? "text-success" : "text-destructive"
                      }`}
                    >
                      {stat.change}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">from last week</p>
                </CardContent>
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 gradient-primary"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  style={{ transformOrigin: "left" }}
                />
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Priority Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Priority Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {priorities.map((priority, index) => (
                  <motion.div
                    key={priority.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{priority.name}</span>
                      <span className="text-muted-foreground">{priority.count} tasks</span>
                    </div>
                    <Progress value={priority.progress} className="h-2" />
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Weekly Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Completion Rate</p>
                      <p className="text-2xl font-bold">{completionRate}%</p>
                    </div>
                    <motion.div
                      className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center shadow-glow"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="text-2xl font-bold text-primary-foreground">
                        {completionRate > 0 ? '↑' : '→'}
                      </span>
                    </motion.div>
                  </div>
                  <div className="pt-4 border-t space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tasks completed</span>
                      <span className="font-medium">{stats?.completed || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tasks pending</span>
                      <span className="font-medium">{stats?.pending || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total tasks</span>
                      <span className="font-medium">{stats?.total || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
