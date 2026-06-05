import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { Paperclip, MessageSquare, Send, LayoutGrid, List, Search, Filter, Plus ,Sun , Moon } from 'lucide-react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, closestCorners, useDraggable, useDroppable, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

import { useTheme } from '../components/ThemeProvider';

const dummyTasks = [
  { id: '1', title: 'Design database schema', status: 'Done', priority: 'High', description: 'Create a normalized PostgreSQL schema for the core entities.' },
  { id: '2', title: 'Build Kanban Board UI', status: 'In Progress', priority: 'Medium', description: 'Implement the frontend drag-and-drop interface using dnd-kit.' },
  { id: '3', title: 'Fix AWS Lockfile', status: 'To Do', priority: 'Low', description: 'Resolve the version mismatch in the terraform lock file.' },
  { id: '4', title: 'Configure Nodemailer', status: 'To Do', priority: 'Medium', description: 'Set up SMTP transport for automated email notifications.' }
];

function KanbanColumn({ title, status, children }: { title: string, status: string, children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id: status });
  // Dynamically switches to a highlighted state when dragging over it
  const bgClass = isOver ? 'bg-muted border-2 border-primary border-dashed' : 'bg-muted/50 border-2 border-transparent';
  const headerColor = status === 'To Do' ? 'text-muted-foreground' : status === 'In Progress' ? 'text-blue-500' : 'text-emerald-500';

  return (
    <div ref={setNodeRef} className={`w-80 shrink-0 rounded-xl p-4 flex flex-col transition-all ${bgClass}`}>
      <h2 className={`text-sm font-bold uppercase tracking-widest mb-4 ${headerColor}`}>{title}</h2>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-3 pr-4 min-h-[200px]">{children}</div>
      </ScrollArea>
    </div>
  );
}

function TaskCard({ task, onClick }: { task: any, onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id, data: { task } });
  const style = { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.3 : 1 };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Card onClick={onClick} className="bg-card border-border text-card-foreground cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors shadow-sm">
        <CardHeader className="p-4 pb-4">
          <div className="flex justify-between items-start mb-2">
            <Badge variant={task.priority === 'High' ? 'destructive' : task.priority === 'Medium' ? 'default' : 'secondary'}>{task.priority}</Badge>
            <span className="text-muted-foreground text-xs">#{task.id}</span>
          </div>
          <CardTitle className="text-sm font-medium leading-snug">{task.title}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

export function Dashboard() {
  const { theme, setTheme } = useTheme();
  const [tasks, setTasks] = useState(dummyTasks);
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({ title: '', description: '', priority: 'Medium' });
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragStart = (event: DragStartEvent) => setActiveTask(tasks.find(t => t.id === event.active.id));
  
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null); 
    const { active, over } = event;
    if (!over) return;
    setTasks(prev => prev.map(t => t.id === active.id ? { ...t, status: over.id as string } : t));
  };

  const handleCreateTask = () => {
    if (!newTaskForm.title.trim()) return;
    const newTask = {
        id: Math.floor(Math.random() * 10000).toString(),
        title: newTaskForm.title,
        description: newTaskForm.description,
        priority: newTaskForm.priority,
        status: 'To Do'
    };
    setTasks([newTask, ...tasks]); // Appends to the top!
    setNewTaskForm({ title: '', description: '', priority: 'Medium' });
    setIsCreateModalOpen(false);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? task.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 h-full flex flex-col bg-background text-foreground min-h-screen transition-colors duration-300">
      
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold mb-2">Project Board</h1>
          <p className="text-muted-foreground">Task 2.3 Kanban Implementation</p>
        </div>

        <div className="flex items-center gap-4">
          {viewMode === 'table' && (
            <div className="flex items-center gap-2 mr-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search tasks..." 
                  className="w-64 pl-9 bg-background border-border text-foreground"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                    <Filter className="mr-2 h-4 w-4" /> {statusFilter || 'All Statuses'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-popover border-border text-popover-foreground">
                  <DropdownMenuItem onClick={() => setStatusFilter(null)}>All Statuses</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('To Do')}>To Do</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('In Progress')}>In Progress</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('Done')}>Done</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <div className="flex bg-muted/50 p-1 rounded-lg border border-border mr-2">
            <Button variant="ghost" size="sm" onClick={() => setViewMode('board')} className={viewMode === 'board' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}>
              <LayoutGrid className="h-4 w-4 mr-2" /> Board
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setViewMode('table')} className={viewMode === 'table' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}>
              <List className="h-4 w-4 mr-2" /> List
            </Button>
          </div>

          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
            className="bg-background border-border text-foreground hover:bg-muted mr-2"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Task
          </Button>
        </div>
      </div>

      {viewMode === 'board' ? (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
            <KanbanColumn title="To Do" status="To Do">
              {tasks.filter(t => t.status === 'To Do').map(task => <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />)}
            </KanbanColumn>
            <KanbanColumn title="In Progress" status="In Progress">
              {tasks.filter(t => t.status === 'In Progress').map(task => <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />)}
            </KanbanColumn>
            <KanbanColumn title="Done" status="Done">
              {tasks.filter(t => t.status === 'Done').map(task => <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />)}
            </KanbanColumn>
          </div>
          <DragOverlay>
            {activeTask ? (
              <Card className="bg-card border-primary text-card-foreground shadow-2xl cursor-grabbing opacity-90 w-72">
                <CardHeader className="p-4 pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={activeTask.priority === 'High' ? 'destructive' : activeTask.priority === 'Medium' ? 'default' : 'secondary'}>{activeTask.priority}</Badge>
                    <span className="text-muted-foreground text-xs">#{activeTask.id}</span>
                  </div>
                  <CardTitle className="text-sm font-medium leading-snug">{activeTask.title}</CardTitle>
                </CardHeader>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-medium w-[100px]">ID</TableHead>
                <TableHead className="text-muted-foreground font-medium">Task Name</TableHead>
                <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                <TableHead className="text-muted-foreground font-medium text-right">Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length > 0 ? filteredTasks.map((task) => (
                <TableRow key={task.id} className="border-border hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => setSelectedTask(task)}>
                  <TableCell className="font-medium text-muted-foreground">#{task.id}</TableCell>
                  <TableCell className="text-foreground font-medium">{task.title}</TableCell>
                  <TableCell>
                     <span className={`text-xs px-2 py-1 rounded-full border ${task.status === 'Done' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : task.status === 'In Progress' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-muted text-muted-foreground border-border'}`}>
                        {task.status}
                     </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={task.priority === 'High' ? 'destructive' : task.priority === 'Medium' ? 'default' : 'secondary'}>{task.priority}</Badge>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No tasks found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* --- MODAL 1: VIEW TASK DETAILS --- */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-4xl bg-background border-border text-foreground p-0 overflow-hidden">
          <div className="flex h-[600px]">
            <div className="flex-1 p-8 border-r border-border space-y-6">
                <DialogHeader>
                    <Badge className="w-fit mb-2" variant={selectedTask?.priority === 'High' ? 'destructive' : 'default'}>{selectedTask?.priority} Priority</Badge>
                    <DialogTitle className="text-2xl font-bold">{selectedTask?.title}</DialogTitle>
                    <DialogDescription className="text-muted-foreground mt-4 text-base leading-relaxed">{selectedTask?.description || "No description provided."}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4 mt-8 border-t border-border/50">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Attachments</h4>
                    <div className="border-2 border-dashed border-border bg-muted/30 rounded-xl p-8 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group">
                        <Paperclip className="mx-auto mb-3 h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                        <p className="text-sm text-foreground font-medium">Click to upload or drag files here</p>
                    </div>
                </div>
            </div>
            <div className="w-80 bg-muted/20 flex flex-col">
                <div className="p-4 border-b border-border flex items-center gap-2 bg-muted/40">
                    <MessageSquare size={18} className="text-primary" />
                    <h4 className="font-bold text-sm tracking-wide">Activity</h4>
                </div>
                <ScrollArea className="flex-1 p-4">
                    {/* FIXED: Generic System Message */}
                    <div className="bg-background border border-border p-3 rounded-lg text-sm shadow-sm">
                        <p className="font-bold text-primary mb-1 text-xs">System Notification</p>
                        <p className="text-muted-foreground leading-relaxed text-xs">Database needs to be connected to sync tasks and activity history.</p>
                    </div>
                </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- MODAL 2: CREATE NEW TASK --- */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription className="text-muted-foreground">Fill out the details below to add a new task to the board.</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Task Title</label>
                <Input 
                    placeholder="e.g. Update user profile UI" 
                    className="bg-background border-border focus-visible:ring-primary"
                    value={newTaskForm.title}
                    onChange={(e) => setNewTaskForm({...newTaskForm, title: e.target.value})}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Priority</label>
                <select 
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    value={newTaskForm.priority}
                    onChange={(e) => setNewTaskForm({...newTaskForm, priority: e.target.value})}
                >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <Textarea 
                    placeholder="Briefly describe the task requirements..." 
                    className="bg-background border-border focus-visible:ring-primary resize-none"
                    value={newTaskForm.description}
                    onChange={(e) => setNewTaskForm({...newTaskForm, description: e.target.value})}
                />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)} className="hover:bg-muted text-muted-foreground hover:text-foreground">Cancel</Button>
            <Button onClick={handleCreateTask}>Save Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}