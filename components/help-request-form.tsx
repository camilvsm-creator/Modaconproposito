"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

import { FieldGroup, InputShell, SectionCard, Button, inputClassName } from "@/components/ui";
import { submitHelpRequest } from "@/lib/help-request-submissions";
import { PRODUCT_OPTIONS, SIZE_OPTIONS } from "@/lib/help-requests";

type ProductRow = {
  name: string;
  quantity: string;
  sizes: { name: string; quantity: string }[];
};

const EMPTY_PRODUCT: ProductRow = { name: "", quantity: "", sizes: [] };

export function HelpRequestForm() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [products, setProducts] = useState<ProductRow[]>([{ ...EMPTY_PRODUCT }]);

  function addProduct() {
    setProducts((prev) => [...prev, { ...EMPTY_PRODUCT, sizes: [] }]);
  }

  function removeProduct(index: number) {
    setProducts((prev) => prev.filter((_, i) => i !== index));
  }

  function updateProduct(index: number, field: keyof ProductRow, value: string) {
    setProducts((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  }

  function addSize(productIndex: number) {
    setProducts((prev) =>
      prev.map((p, i) =>
        i === productIndex
          ? { ...p, sizes: [...p.sizes, { name: "", quantity: "" }] }
          : p,
      ),
    );
  }

  function removeSize(productIndex: number, sizeIndex: number) {
    setProducts((prev) =>
      prev.map((p, i) =>
        i === productIndex
          ? { ...p, sizes: p.sizes.filter((_, si) => si !== sizeIndex) }
          : p,
      ),
    );
  }

  function updateSize(productIndex: number, sizeIndex: number, field: "name" | "quantity", value: string) {
    setProducts((prev) =>
      prev.map((p, i) =>
        i === productIndex
          ? {
              ...p,
              sizes: p.sizes.map((s, si) =>
                si === sizeIndex ? { ...s, [field]: value } : s,
              ),
            }
          : p,
      ),
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(undefined);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("products", JSON.stringify(products));

    const result = await submitHelpRequest(formData);

    if (!result.success) {
      setSubmitError(result.error);
      setIsSubmitting(false);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <SectionCard className="p-8 text-center">
        <div className="space-y-3">
          <p className="text-lg font-bold text-ink">Solicitud enviada</p>
          <p className="text-sm text-stone-600">
            Tu solicitud de ayuda fue registrada exitosamente. Nos pondremos en contacto contigo pronto.
          </p>
          <Button variant="secondary" onClick={() => { setSubmitted(false); setProducts([{ ...EMPTY_PRODUCT }]); }}>
            Enviar otra solicitud
          </Button>
        </div>
      </SectionCard>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError ? (
        <SectionCard className="border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {submitError}
        </SectionCard>
      ) : null}

      <SectionCard>
        <FieldGroup title="Datos del solicitante" description="Información de la persona o organización que solicita ayuda.">
          <div className="grid gap-4 sm:grid-cols-2">
            <InputShell label="Nombre completo" hint="Requerido">
              <input name="fullName" required className={inputClassName} placeholder="Nombre y apellido" />
            </InputShell>
            <InputShell label="Organización">
              <input name="organization" className={inputClassName} placeholder="Refugio, fundación, etc." />
            </InputShell>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputShell label="Teléfono" hint="Requerido">
              <input name="phone" required className={inputClassName} placeholder="0414-1234567" />
            </InputShell>
            <InputShell label="Correo electrónico" hint="Requerido">
              <input name="email" type="email" required className={inputClassName} placeholder="correo@ejemplo.com" />
            </InputShell>
          </div>
          <InputShell label="Tipo de solicitante" hint="Requerido">
            <select name="requesterType" required className={inputClassName}>
              <option value="">Selecciona una opción</option>
              <option value="refugio">Refugio</option>
              <option value="fundacion">Fundación u ONG</option>
              <option value="persona_afectada">Persona afectada</option>
              <option value="otro">Otro</option>
            </select>
          </InputShell>
        </FieldGroup>
      </SectionCard>

      <SectionCard>
        <FieldGroup title="Ubicación" description="Dirección de entrega de los productos solicitados.">
          <div className="grid gap-4 sm:grid-cols-2">
            <InputShell label="Estado" hint="Requerido">
              <input name="state" required className={inputClassName} placeholder="Estado" />
            </InputShell>
            <InputShell label="Ciudad" hint="Requerido">
              <input name="city" required className={inputClassName} placeholder="Ciudad" />
            </InputShell>
          </div>
          <InputShell label="Dirección de entrega" hint="Requerido">
            <input name="deliveryAddress" required className={inputClassName} placeholder="Calle, edificio, urbanización" />
          </InputShell>
        </FieldGroup>
      </SectionCard>

      <SectionCard>
        <FieldGroup title="Productos solicitados" description="Selecciona los productos, cantidades y tallas necesarias.">
          <div className="space-y-4">
            {products.map((product, pi) => (
              <div key={pi} className="rounded-lg border border-stone-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-stone-500">Producto {pi + 1}</span>
                  {products.length > 1 ? (
                    <button type="button" onClick={() => removeProduct(pi)} className="text-stone-400 hover:text-red-500 transition">
                      <X className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="block text-sm font-medium text-stone-900">Producto</span>
                    <select
                      required
                      className={inputClassName}
                      value={product.name}
                      onChange={(e) => updateProduct(pi, "name", e.target.value)}
                    >
                      <option value="">Selecciona un producto</option>
                      {PRODUCT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block space-y-2">
                    <span className="block text-sm font-medium text-stone-900">Cantidad</span>
                    <input
                      type="number"
                      min="1"
                      required
                      className={inputClassName}
                      placeholder="0"
                      value={product.quantity}
                      onChange={(e) => updateProduct(pi, "quantity", e.target.value)}
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-stone-700">Tallas</span>
                    <button type="button" onClick={() => addSize(pi)} className="inline-flex items-center gap-1 text-sm text-[#F74897] hover:underline">
                      <Plus className="h-3.5 w-3.5" /> Agregar talla
                    </button>
                  </div>
                  {product.sizes.length > 0 ? (
                    <div className="space-y-2">
                      {product.sizes.map((size, si) => (
                        <div key={si} className="flex items-center gap-2">
                          <select
                            required
                            className={inputClassName}
                            value={size.name}
                            onChange={(e) => updateSize(pi, si, "name", e.target.value)}
                          >
                            <option value="">Talla</option>
                            {SIZE_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min="1"
                            required
                            className={inputClassName}
                            placeholder="Cant."
                            value={size.quantity}
                            onChange={(e) => updateSize(pi, si, "quantity", e.target.value)}
                          />
                          <button type="button" onClick={() => removeSize(pi, si)} className="text-stone-400 hover:text-red-500 transition shrink-0">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-stone-400">Sin tallas específicas</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={addProduct} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#F74897] hover:underline">
            <Plus className="h-4 w-4" /> Agregar otro producto
          </button>
        </FieldGroup>
      </SectionCard>

      <SectionCard>
        <FieldGroup title="Descripción y evidencias">
          <InputShell label="Nivel de urgencia" hint="Requerido">
            <select name="urgency" required className={inputClassName}>
              <option value="">Selecciona</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </InputShell>
          <InputShell label="Descripción" hint="Explica la situación y cualquier información relevante">
            <textarea
              name="description"
              rows={4}
              required
              className={inputClassName}
              placeholder="Describe la situación, número de personas afectadas, necesidades específicas..."
            />
          </InputShell>
          <InputShell label="Evidencias" hint="Fotografías o documentos que ayuden a validar la solicitud (opcional)">
            <input
              type="file"
              name="evidence"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              className="block w-full text-sm text-stone-600 file:mr-4 file:rounded-full file:border-0 file:bg-[#FFE4EC] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#F74897] hover:file:bg-[#F74897]/10"
            />
          </InputShell>
        </FieldGroup>
      </SectionCard>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar solicitud"}
        </Button>
      </div>
    </form>
  );
}
