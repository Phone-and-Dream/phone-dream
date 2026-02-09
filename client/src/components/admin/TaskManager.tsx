import { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Loader2, 
  Twitter, 
  User, 
  Star, 
  FileText,
  Check,
  X,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAllTasks, useCreateTask, useUpdateTask, useDeleteTask, useTaskCompletionStats } from '@/hooks/useAdminTasks';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'];

const taskTypeIcons: Record<string, React.ReactNode> = {
  social: <Twitter className="h-4 w-4" />,
  profile: <User className="h-4 w-4" />,
  platform: <Star className="h-4 w-4" />,
  custom: <FileText className="h-4 w-4" />,
};

const taskTypeLabels: Record<string, string> = {
  social: 'Social Media',
  profile: 'Profile Completion',
  platform: 'Platform Engagement',
  custom: 'Custom Task',
};

const verificationTypeLabels: Record<string, string> = {
  auto: 'Auto-verify',
  manual: 'Manual Review',
};

interface TaskFormData {
  title: string;
  description: string;
  task_type: string;
  xp_value: number;
  verification_type: string;
  action_url: string;
  is_active: boolean;
  requires_verification: boolean;
}

const defaultFormData: TaskFormData = {
  title: '',
  description: '',
  task_type: 'profile',
  xp_value: 10,
  verification_type: 'auto',
  action_url: '',
  is_active: true,
  requires_verification: false,
};

export function TaskManager() {
  const { data: tasks = [], isLoading } = useAllTasks();
  const { data: completionStats = {} } = useTaskCompletionStats();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [formData, setFormData] = useState<TaskFormData>(defaultFormData);

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || task.task_type === filterType;
    return matchesSearch && matchesType;
  });

  const handleOpenCreate = () => {
    setEditingTask(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      task_type: task.task_type,
      xp_value: task.xp_value,
      verification_type: task.verification_type || 'auto',
      action_url: task.action_url || '',
      is_active: task.is_active,
      requires_verification: task.requires_verification,
    });
    setIsModalOpen(true);
  };

  const handleOpenDelete = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Task title is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingTask) {
        await updateTask.mutateAsync({
          id: editingTask.id,
          ...formData,
        });
        toast({
          title: 'Task Updated',
          description: `"${formData.title}" has been updated.`,
        });
      } else {
        await createTask.mutateAsync(formData);
        toast({
          title: 'Task Created',
          description: `"${formData.title}" has been created.`,
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving task:', error);
      toast({
        title: 'Error',
        description: 'Failed to save task. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    
    try {
      await deleteTask.mutateAsync(taskToDelete.id);
      toast({
        title: 'Task Deleted',
        description: `"${taskToDelete.title}" has been deleted.`,
      });
      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (task: Task) => {
    try {
      await updateTask.mutateAsync({
        id: task.id,
        is_active: !task.is_active,
      });
      toast({
        title: task.is_active ? 'Task Deactivated' : 'Task Activated',
        description: `"${task.title}" is now ${task.is_active ? 'inactive' : 'active'}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update task status.',
        variant: 'destructive',
      });
    }
  };

  // Stats calculations
  const totalTasks = tasks.length;
  const activeTasks = tasks.filter(t => t.is_active).length;
  const totalXPAvailable = tasks.filter(t => t.is_active).reduce((sum, t) => sum + t.xp_value, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-primary">{totalTasks}</p>
          <p className="text-sm text-muted-foreground">Total Tasks</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-accent">{activeTasks}</p>
          <p className="text-sm text-muted-foreground">Active Tasks</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-info">{totalXPAvailable}</p>
          <p className="text-sm text-muted-foreground">Total XP Available</p>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h2 className="font-semibold text-lg">Task Management</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="profile">Profile</SelectItem>
                <SelectItem value="platform">Platform</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>XP Value</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Completions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length > 0 ? filteredTasks.map((task) => {
                const stats = completionStats[task.id] || { total: 0, completed: 0, pending: 0 };
                return (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                          task.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        )}>
                          {taskTypeIcons[task.task_type] || <FileText className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className={cn(
                            "font-medium",
                            !task.is_active && "text-muted-foreground"
                          )}>{task.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{taskTypeLabels[task.task_type] || task.task_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-primary/10 text-primary border-0">
                        +{task.xp_value} XP
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {verificationTypeLabels[task.verification_type || 'auto']}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="text-accent font-medium">{stats.completed}</span>
                        <span className="text-muted-foreground"> completed</span>
                        {stats.pending > 0 && (
                          <span className="text-warning ml-1">({stats.pending} pending)</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={task.is_active}
                        onCheckedChange={() => handleToggleActive(task)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleOpenEdit(task)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleOpenDelete(task)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchQuery || filterType !== 'all' 
                      ? 'No tasks match your filters' 
                      : 'No tasks created yet. Click "Add Task" to create one.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            <DialogDescription>
              {editingTask 
                ? 'Modify the task details below.' 
                : 'Create a new task for recipients to complete and earn XP.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Follow us on Twitter"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what the recipient needs to do..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task_type">Task Type</Label>
                <Select 
                  value={formData.task_type} 
                  onValueChange={(value) => setFormData({ ...formData, task_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="profile">Profile Completion</SelectItem>
                    <SelectItem value="platform">Platform Engagement</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="xp_value">XP Value</Label>
                <Input
                  id="xp_value"
                  type="number"
                  min={1}
                  value={formData.xp_value}
                  onChange={(e) => setFormData({ ...formData, xp_value: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="verification_type">Verification</Label>
                <Select 
                  value={formData.verification_type} 
                  onValueChange={(value) => setFormData({ ...formData, verification_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-verify</SelectItem>
                    <SelectItem value="manual">Manual Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="action_url">Action URL (optional)</Label>
                <Input
                  id="action_url"
                  type="url"
                  placeholder="https://..."
                  value={formData.action_url}
                  onChange={(e) => setFormData({ ...formData, action_url: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active" className="text-sm">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="requires_verification"
                  checked={formData.requires_verification}
                  onCheckedChange={(checked) => setFormData({ ...formData, requires_verification: checked })}
                />
                <Label htmlFor="requires_verification" className="text-sm">Requires Verification</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={createTask.isPending || updateTask.isPending}>
              {(createTask.isPending || updateTask.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingTask ? 'Save Changes' : 'Create Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{taskToDelete?.title}"? This action cannot be undone.
              Any recipient progress on this task will be preserved but the task will no longer be available.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteTask.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
