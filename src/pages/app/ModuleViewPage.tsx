import { useEffect, useState, useCallback } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { api } from '@/lib/api-client';
import { PlusCircle, Search, Loader2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { CrmApp, Module, Field, Record as CrmRecord } from '@shared/saas-types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ModuleData {
    module: Module;
    fields: Field[];
    views: unknown[];
}

interface RecordsData {
    records: CrmRecord[];
    total: number;
}

export default function ModuleViewPage() {
    const { appId, moduleId } = useParams<{ appId: string; moduleId: string }>();
    const context = useOutletContext<{ app?: CrmApp; modules?: Module[] }>();

    const [moduleData, setModuleData] = useState<ModuleData | null>(null);
    const [records, setRecords] = useState<CrmRecord[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingRecords, setIsLoadingRecords] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState<Record<string, unknown>>({});

    const fetchRecords = useCallback(async () => {
        if (!moduleId) return;
        setIsLoadingRecords(true);
        try {
            const data = await api<RecordsData>(`/api/saas/modules/${moduleId}/records`);
            setRecords(data.records);
            setTotal(data.total);
        } catch (err) {
            console.error("Failed to load records:", err);
        } finally {
            setIsLoadingRecords(false);
        }
    }, [moduleId]);

    useEffect(() => {
        if (moduleId) {
            setIsLoading(true);
            api<ModuleData>(`/api/saas/modules/${moduleId}`)
                .then(setModuleData)
                .catch(err => console.error("Failed to load module:", err))
                .finally(() => setIsLoading(false));

            fetchRecords();
        }
    }, [moduleId, fetchRecords]);

    const listFields = moduleData?.fields.filter(f => f.showInList) || [];
    const formFields = moduleData?.fields.filter(f => f.showInForm) || [];
    const app = context?.app;
    const primaryColor = app?.branding?.primaryColor || '#6366f1';

    const handleCreateRecord = async () => {
        if (!moduleId) return;
        setIsCreating(true);
        try {
            await api(`/api/saas/modules/${moduleId}/records`, {
                method: 'POST',
                body: JSON.stringify({ data: formData }),
            });
            setIsCreateOpen(false);
            setFormData({});
            fetchRecords();
        } catch (err) {
            console.error("Failed to create record:", err);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteRecord = async (recordId: string) => {
        if (!confirm('Are you sure you want to delete this record?')) return;
        try {
            await api(`/api/saas/records/${recordId}`, { method: 'DELETE' });
            fetchRecords();
        } catch (err) {
            console.error("Failed to delete record:", err);
        }
    };

    const renderFieldInput = (field: Field) => {
        const value = formData[field.name];
        const onChange = (val: unknown) => setFormData(prev => ({ ...prev, [field.name]: val }));

        switch (field.type) {
            case 'textarea':
                return (
                    <Textarea
                        value={(value as string) || ''}
                        onChange={e => onChange(e.target.value)}
                        placeholder={field.placeholder}
                    />
                );
            case 'select':
                return (
                    <Select value={(value as string) || ''} onValueChange={onChange}>
                        <SelectTrigger>
                            <SelectValue placeholder={field.placeholder || 'Select...'} />
                        </SelectTrigger>
                        <SelectContent>
                            {field.options.choices?.map(choice => (
                                <SelectItem key={choice.value} value={choice.value}>
                                    {choice.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            case 'checkbox':
                return (
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={Boolean(value)}
                            onChange={e => onChange(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <span className="text-sm text-muted-foreground">{field.label}</span>
                    </div>
                );
            case 'number':
            case 'currency':
                return (
                    <Input
                        type="number"
                        value={(value as number) || ''}
                        onChange={e => onChange(e.target.value ? Number(e.target.value) : '')}
                        placeholder={field.placeholder}
                    />
                );
            case 'date':
                return (
                    <Input
                        type="date"
                        value={(value as string) || ''}
                        onChange={e => onChange(e.target.value)}
                    />
                );
            case 'email':
                return (
                    <Input
                        type="email"
                        value={(value as string) || ''}
                        onChange={e => onChange(e.target.value)}
                        placeholder={field.placeholder}
                    />
                );
            case 'phone':
                return (
                    <Input
                        type="tel"
                        value={(value as string) || ''}
                        onChange={e => onChange(e.target.value)}
                        placeholder={field.placeholder}
                    />
                );
            case 'url':
                return (
                    <Input
                        type="url"
                        value={(value as string) || ''}
                        onChange={e => onChange(e.target.value)}
                        placeholder={field.placeholder}
                    />
                );
            default:
                return (
                    <Input
                        value={(value as string) || ''}
                        onChange={e => onChange(e.target.value)}
                        placeholder={field.placeholder}
                    />
                );
        }
    };

    const renderCellValue = (field: Field, value: unknown) => {
        if (value === null || value === undefined) {
            return <span className="text-muted-foreground">-</span>;
        }

        switch (field.type) {
            case 'select': {
                const choice = field.options.choices?.find(c => c.value === value);
                return choice ? (
                    <Badge
                        variant="outline"
                        style={{
                            backgroundColor: choice.color ? `${choice.color}20` : undefined,
                            borderColor: choice.color,
                            color: choice.color,
                        }}
                    >
                        {choice.label}
                    </Badge>
                ) : String(value);
            }
            case 'checkbox':
                return value ? '✓' : '✗';
            case 'currency':
                return `$${Number(value).toLocaleString()}`;
            case 'date':
                return new Date(value as string).toLocaleDateString();
            case 'email':
                return <a href={`mailto:${value}`} className="text-primary hover:underline">{String(value)}</a>;
            case 'url':
                return <a href={value as string} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{String(value)}</a>;
            default:
                return String(value);
        }
    };

    const filteredRecords = records.filter(record => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return Object.values(record.data).some(val =>
            String(val).toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    {isLoading ? (
                        <>
                            <Skeleton className="h-8 w-48 mb-2" />
                            <Skeleton className="h-4 w-64" />
                        </>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {moduleData?.module.displayName}
                            </h1>
                            <p className="text-muted-foreground">
                                {moduleData?.module.description || `Manage your ${moduleData?.module.displayName.toLowerCase()}`}
                            </p>
                        </>
                    )}
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button
                            className="gap-2"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <PlusCircle className="h-4 w-4" />
                            Add {moduleData?.module.displayName.replace(/s$/, '') || 'Record'}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>
                                Add New {moduleData?.module.displayName.replace(/s$/, '')}
                            </DialogTitle>
                            <DialogDescription>
                                Fill in the details below to create a new record.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                            {formFields.map(field => (
                                <div key={field.id} className="space-y-2">
                                    <Label htmlFor={field.name}>
                                        {field.label}
                                        {field.required && <span className="text-red-500 ml-1">*</span>}
                                    </Label>
                                    {renderFieldInput(field)}
                                </div>
                            ))}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateRecord} disabled={isCreating}>
                                {isCreating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="pt-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search records..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {total} total records
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Records Table */}
            <Card>
                <CardContent className="p-0">
                    {isLoadingRecords ? (
                        <div className="p-6 space-y-3">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : filteredRecords.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <PlusCircle className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">
                                {searchTerm ? 'No matching records' : 'No records yet'}
                            </h3>
                            <p className="text-muted-foreground text-center mb-4">
                                {searchTerm
                                    ? 'Try a different search term'
                                    : `Create your first ${moduleData?.module.displayName.replace(/s$/, '').toLowerCase()}`
                                }
                            </p>
                            {!searchTerm && (
                                <Button onClick={() => setIsCreateOpen(true)}>
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Add {moduleData?.module.displayName.replace(/s$/, '')}
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {listFields.map(field => (
                                        <TableHead key={field.id}>{field.label}</TableHead>
                                    ))}
                                    <TableHead className="w-10"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRecords.map(record => (
                                    <TableRow key={record.id}>
                                        {listFields.map(field => (
                                            <TableCell key={field.id}>
                                                {renderCellValue(field, record.data[field.name])}
                                            </TableCell>
                                        ))}
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Pencil className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => handleDeleteRecord(record.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
