import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Product, insertProductSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Plus, Pencil, Trash2, Search, X, FileImage, Loader2, CheckCircle2, Upload, ChevronsUpDown, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const productFormSchema = insertProductSchema.extend({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  carModel: z.string().min(2, "O modelo do carro é obrigatório"),
  transmission: z.string().min(2, "A transmissão é obrigatória"),
  motorization: z.string().min(2, "A motorização é obrigatória"),
  year: z.string().min(2, "O ano é obrigatório"),
  imageUrl: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ComboboxFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  isLoading?: boolean;
  label: string;
}

function ComboboxField({ value, onChange, options, placeholder, isLoading, label }: ComboboxFieldProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(inputValue.toLowerCase())
  );

  const showCustomOption = inputValue.length > 0 && !options.some(
    opt => opt.toLowerCase() === inputValue.toLowerCase()
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando...
            </span>
          ) : value ? (
            <span className="truncate">{value}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={`Buscar ou digitar ${label.toLowerCase()}...`}
            value={inputValue}
            onValueChange={(val) => {
              setInputValue(val);
              onChange(val);
            }}
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Carregando opções...</span>
              </div>
            ) : (
              <>
                {filteredOptions.length === 0 && !showCustomOption && (
                  <CommandEmpty>Nenhuma opção encontrada. Digite para criar.</CommandEmpty>
                )}
                {showCustomOption && (
                  <CommandGroup heading="Novo valor">
                    <CommandItem
                      value={inputValue}
                      onSelect={() => {
                        onChange(inputValue);
                        setOpen(false);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Criar "{inputValue}"
                    </CommandItem>
                  </CommandGroup>
                )}
                {filteredOptions.length > 0 && (
                  <CommandGroup heading="Opções existentes">
                    {filteredOptions.map((option) => (
                      <CommandItem
                        key={option}
                        value={option}
                        onSelect={() => {
                          onChange(option);
                          setInputValue(option);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === option ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {option}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface ImageGalleryProps {
  value: string;
  onChange: (value: string) => void;
}

function ImageGallery({ value, onChange }: ImageGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: availableImages = [], isLoading: isLoadingImages } = useQuery({
    queryKey: ["/api/product-images"],
    queryFn: async () => {
      const images = await apiRequest("/api/product-images") as string[];
      return images.map(fixImagePath);
    }
  });

  function fixImagePath(path: any): string {
    if (!path || typeof path !== 'string') {
      return '/products/sample-converter.jpg';
    }
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return path.startsWith('/') ? path : `/${path}`;
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Imagem enviada",
          description: "A imagem foi enviada com sucesso!",
        });
        onChange(result.path);
        queryClient.invalidateQueries({ queryKey: ["/api/product-images"] });
        setIsOpen(false);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao enviar imagem",
        description: error.message || "Ocorreu um erro ao enviar a imagem.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const imagePreview = fixImagePath(value);

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden aspect-video bg-muted/50 relative">
        {value ? (
          <>
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/products/sample-converter.jpg';
                (e.target as HTMLImageElement).onerror = null;
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
              <p className="text-white text-xs truncate">{imagePreview.split('/').pop()}</p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <FileImage className="h-12 w-12 mb-2 opacity-50" />
            <p className="text-sm">Nenhuma imagem selecionada</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" className="flex-1">
              <FileImage className="h-4 w-4 mr-2" />
              Galeria
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-4" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Selecionar Imagem</h4>
                <Badge variant="outline">{availableImages.length} disponíveis</Badge>
              </div>

              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Enviar nova imagem
                    </>
                  )}
                </Button>
              </div>

              {isLoadingImages ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Carregando imagens...</span>
                </div>
              ) : availableImages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileImage className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma imagem na galeria</p>
                  <p className="text-xs mt-1">Envie uma imagem para começar</p>
                </div>
              ) : (
                <ScrollArea className="h-[250px]">
                  <div className="grid grid-cols-3 gap-2">
                    {availableImages.map((imgPath: string, index: number) => {
                      const isSelected = value === imgPath;
                      return (
                        <div
                          key={index}
                          className={cn(
                            "relative border rounded-md overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary/60",
                            isSelected && "ring-2 ring-primary"
                          )}
                          onClick={() => {
                            onChange(imgPath);
                            setIsOpen(false);
                          }}
                        >
                          <div className="aspect-square bg-muted">
                            <img
                              src={imgPath}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/products/sample-converter.jpg';
                                (e.target as HTMLImageElement).onerror = null;
                              }}
                            />
                          </div>
                          {isSelected && (
                            <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-0.5">
                              <CheckCircle2 className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {value && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

interface ProductFormComponentProps {
  form: any;
  onSubmit: (data: any) => void;
  isEdit?: boolean;
}

function ProductFormComponent({ form, onSubmit, isEdit = false }: ProductFormComponentProps) {
  const { data: carModels = [], isLoading: loadingCarModels } = useQuery({
    queryKey: ["/api/filters/car-models"],
    queryFn: () => apiRequest("/api/filters/car-models") as Promise<string[]>
  });

  const { data: transmissions = [], isLoading: loadingTransmissions } = useQuery({
    queryKey: ["/api/filters/all-transmissions"],
    queryFn: () => apiRequest("/api/filters/all-transmissions") as Promise<string[]>
  });

  const { data: motorizations = [], isLoading: loadingMotorizations } = useQuery({
    queryKey: ["/api/filters/all-motorizations"],
    queryFn: () => apiRequest("/api/filters/all-motorizations") as Promise<string[]>
  });

  const { data: years = [], isLoading: loadingYears } = useQuery({
    queryKey: ["/api/filters/all-years"],
    queryFn: () => apiRequest("/api/filters/all-years") as Promise<string[]>
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {isEdit && (
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID do Produto</FormLabel>
                <FormControl>
                  <Input {...field} readOnly className="bg-muted" />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Conversor de Torque BMW" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição detalhada do produto..."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="carModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo do Carro *</FormLabel>
                    <FormControl>
                      <ComboboxField
                        value={field.value}
                        onChange={field.onChange}
                        options={carModels}
                        placeholder="Selecionar modelo"
                        isLoading={loadingCarModels}
                        label="modelo"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transmission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transmissão *</FormLabel>
                    <FormControl>
                      <ComboboxField
                        value={field.value}
                        onChange={field.onChange}
                        options={transmissions}
                        placeholder="Selecionar transmissão"
                        isLoading={loadingTransmissions}
                        label="transmissão"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="motorization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motorização *</FormLabel>
                    <FormControl>
                      <ComboboxField
                        value={field.value}
                        onChange={field.onChange}
                        options={motorizations}
                        placeholder="Selecionar motor"
                        isLoading={loadingMotorizations}
                        label="motorização"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano *</FormLabel>
                    <FormControl>
                      <ComboboxField
                        value={field.value}
                        onChange={field.onChange}
                        options={years}
                        placeholder="Selecionar ano"
                        isLoading={loadingYears}
                        label="ano"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagem do Produto</FormLabel>
                  <FormControl>
                    <ImageGallery
                      value={field.value || ''}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted/50 rounded-lg p-4 border">
              <h4 className="font-medium text-sm mb-2">Dicas</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Campos com * são obrigatórios</li>
                <li>• Você pode digitar valores personalizados nos campos de seleção</li>
                <li>• Imagens devem ter até 10MB (JPG, PNG, GIF, WebP)</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEdit ? "Salvar Alterações" : "Adicionar Produto"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export function ProductAdmin() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products"],
    queryFn: () => apiRequest("/api/products") as Promise<Product[]>
  });

  const addProductMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      return await apiRequest("/api/products", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, createdAt: new Date().toISOString() })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/filters/car-models"] });
      queryClient.invalidateQueries({ queryKey: ["/api/filters/all-transmissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/filters/all-motorizations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/filters/all-years"] });
      setIsAddDialogOpen(false);
      addForm.reset();
      toast({ title: "Produto adicionado", description: "Produto adicionado com sucesso ao catálogo." });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message || "Erro ao adicionar produto.", variant: "destructive" });
    }
  });

  const editProductMutation = useMutation({
    mutationFn: async (data: ProductFormValues & { id: number }) => {
      const { id, ...productData } = data;
      return await apiRequest(`/api/products/${id}`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/filters/car-models"] });
      queryClient.invalidateQueries({ queryKey: ["/api/filters/all-transmissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/filters/all-motorizations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/filters/all-years"] });
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      toast({ title: "Produto atualizado", description: "Alterações salvas com sucesso." });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message || "Erro ao atualizar produto.", variant: "destructive" });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/products/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      toast({ title: "Produto excluído", description: "Produto removido do catálogo." });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message || "Erro ao excluir produto.", variant: "destructive" });
    }
  });

  const addForm = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      carModel: "",
      transmission: "",
      motorization: "",
      year: "",
      imageUrl: "",
    }
  });

  const editForm = useForm<ProductFormValues & { id: number }>({
    resolver: zodResolver(productFormSchema.extend({ id: z.number() })),
    defaultValues: {
      id: 0,
      name: "",
      description: "",
      carModel: "",
      transmission: "",
      motorization: "",
      year: "",
      imageUrl: "",
    }
  });

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    editForm.reset({
      id: product.id,
      name: product.name,
      description: product.description,
      carModel: product.carModel,
      transmission: product.transmission,
      motorization: product.motorization,
      year: product.year,
      imageUrl: product.imageUrl || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const filteredProducts = products.filter((product: Product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.carModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.transmission.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Gerenciar Produtos</CardTitle>
            <CardDescription>Adicione, edite ou remova produtos do catálogo.</CardDescription>
          </div>
          <div className="flex gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar produtos..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) addForm.reset();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-1" /> Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Produto</DialogTitle>
                  <DialogDescription>
                    Preencha os campos para adicionar um novo produto ao catálogo.
                  </DialogDescription>
                </DialogHeader>
                <ProductFormComponent
                  form={addForm}
                  onSubmit={(data) => addProductMutation.mutate(data)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Carregando produtos...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchTerm ? "Nenhum produto encontrado." : "Nenhum produto cadastrado."}
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Modelo</TableHead>
                  <TableHead className="hidden lg:table-cell">Transmissão</TableHead>
                  <TableHead className="hidden lg:table-cell">Motorização</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product: Product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {product.name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-[150px] truncate">
                      {product.carModel}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell max-w-[150px] truncate">
                      {product.transmission}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell max-w-[150px] truncate">
                      {product.motorization}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(product)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Produto</DialogTitle>
              <DialogDescription>Faça as alterações desejadas nos campos abaixo.</DialogDescription>
            </DialogHeader>
            <ProductFormComponent
              form={editForm}
              onSubmit={(data) => editProductMutation.mutate(data)}
              isEdit
            />
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Produto</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir "{selectedProduct?.name}"? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => selectedProduct && deleteProductMutation.mutate(selectedProduct.id)}>
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
