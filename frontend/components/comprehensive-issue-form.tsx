'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

import { credentialSchema, CredentialFormData } from '@/lib/schemas/credential';
import { isSupabaseConfigured } from '@/lib/supabase';

interface ComprehensiveIssueFormProps {
    onSuccess?: () => void;
}

export function ComprehensiveIssueForm({ onSuccess }: ComprehensiveIssueFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadingTranscript, setUploadingTranscript] = useState(false);
    const [successData, setSuccessData] = useState<{
        transactionHash: string;
        studentName: string;
    } | null>(null);

    const form = useForm<CredentialFormData>({
        resolver: zodResolver(credentialSchema),
        defaultValues: {
            studentName: '',
            fatherName: '',
            phoneNumber: '',
            personalEmail: '',
            studentEmail: '',
            studentId: '',
            cnic: '',
            degreeLevel: undefined,
            department: undefined,
            cgpa: 0.0,
            internalGrade: '',
            graduationStartDate: undefined,
            graduationEndDate: undefined,
            transcriptUrl: '',
            finalComment: '',
        },
    });

    async function handleTranscriptUpload(file: File) {
        setUploadingTranscript(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'transcripts'); // You'll need to create this preset in Cloudinary

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const data = await response.json();
            if (data.secure_url) {
                form.setValue('transcriptUrl', data.secure_url);
            } else {
                throw new Error('Upload failed');
            }
        } catch (err) {
            setError('Failed to upload transcript');
        } finally {
            setUploadingTranscript(false);
        }
    }

    async function onSubmit(data: CredentialFormData) {
        setError(null);
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/issue-credential', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    graduationStartDate: format(data.graduationStartDate, 'yyyy-MM-dd'),
                    graduationEndDate: format(data.graduationEndDate, 'yyyy-MM-dd'),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to issue credential');
            }

            setSuccessData({
                transactionHash: result.transactionHash,
                studentName: data.studentName,
            });
            form.reset();
            onSuccess?.();
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!isSupabaseConfigured) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Please configure Supabase first. See <strong>SUPABASE_SETUP.md</strong>
                </AlertDescription>
            </Alert>
        );
    }

    if (successData) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <CardTitle>Credential Issued Successfully!</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm font-medium">Student</p>
                        <p className="text-sm text-muted-foreground">{successData.studentName}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Blockchain Transaction</p>
                        <a
                            href={`https://amoy.polygonscan.com/tx/${successData.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline font-mono break-all"
                        >
                            {successData.transactionHash}
                        </a>
                    </div>
                    <Button onClick={() => setSuccessData(null)} className="w-full">
                        Issue Another Credential
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Student identity and contact details</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="studentName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Student Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Muhammad Ali" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="fatherName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Father Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Father's full name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="03201234567" {...field} />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        11 digits starting with 03
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cnic"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>National CNIC</FormLabel>
                                    <FormControl>
                                        <Input placeholder="1234567890123" {...field} />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        13 digits, no dashes
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="personalEmail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Personal Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="zuhair@gmail.com" type="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="studentEmail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Student Email (LGU)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="fa-2022-bscs-001@cs.lgu.edu.pk" {...field} />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Format: fa/sp-YYYY-dept-NNN@cs.lgu.edu.pk
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="studentId"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Student ID</FormLabel>
                                    <FormControl>
                                        <Input placeholder="fa-2022-bscs-001 or sp-2022-bscs-001" {...field} />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Format: fa/sp-YYYY-dept-NNN (dept: bscs/bsse/bsit)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Academic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Academic Information</CardTitle>
                        <CardDescription>Degree and academic performance details</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="degreeLevel"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Degree Level</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select degree" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Bachelors">Bachelors</SelectItem>
                                            <SelectItem value="Masters">Masters</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="department"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Department</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Computer Science">Computer Science</SelectItem>
                                            <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                                            <SelectItem value="IT">IT</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cgpa"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>CGPA</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="4"
                                            placeholder="3.50"
                                            {...field}
                                            value={field.value ?? ''}
                                            onChange={(e) => {
                                                const value = parseFloat(e.target.value);
                                                field.onChange(isNaN(value) ? 0 : value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Scale: 0.0 - 4.0
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="internalGrade"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Internal Grade</FormLabel>
                                    <FormControl>
                                        <Input placeholder="A, B+, etc." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="graduationStartDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Graduation Start Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        'w-full pl-3 text-left font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}
                                                >
                                                    {field.value ? format(field.value, 'PPP') : <span>Pick date</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                captionLayout="dropdown"
                                                fromYear={2000}
                                                toYear={new Date().getFullYear() + 10}
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date > new Date() || date < new Date('2000-01-01')}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="graduationEndDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Graduation End Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        'w-full pl-3 text-left font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}
                                                >
                                                    {field.value ? format(field.value, 'PPP') : <span>Pick date</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                captionLayout="dropdown"
                                                fromYear={2000}
                                                toYear={new Date().getFullYear() + 10}
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date > new Date() || date < new Date('2000-01-01')}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="transcriptUrl"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Transcript Upload</FormLabel>
                                    <FormControl>
                                        <div className="space-y-2">
                                            <Input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleTranscriptUpload(file);
                                                }}
                                                disabled={uploadingTranscript}
                                            />
                                            {field.value && (
                                                <p className="text-xs text-green-600">✓ Transcript uploaded successfully</p>
                                            )}
                                            {uploadingTranscript && (
                                                <p className="text-xs text-muted-foreground">Uploading...</p>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Upload student transcript (PDF, JPG, PNG)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="finalComment"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Final Comment (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Additional notes or comments..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Maximum 500 characters
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Button type="submit" disabled={isSubmitting || uploadingTranscript} className="w-full" size="lg">
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Issuing Credential...
                        </>
                    ) : (
                        'Issue Credential'
                    )}
                </Button>
            </form>
        </Form>
    );
}
