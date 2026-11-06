// src/pages/admin/AdminProductsManager.tsx
import React, { useState } from "react";
import {
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  Search,
  ExternalLink,
  CheckCircle2,
  X,
  Save,
} from "lucide-react";
import { useCMS } from "../CMSContext";
import { CmsProduct } from "../cmsService";
import { ImageUpload } from "../../components/common/ImageUpload";
import { ProductStatusBadge } from "../../components/common/ProductStatusBadge";

export const AdminProductsManager: React.FC = () => {
  const { products, saveProduct, deleteProduct } = useCMS();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "Live" | "Under Development"
  >("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Partial<CmsProduct> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "Live" &&
        (p.status === "Live" || p.status === "PUBLISHED")) ||
      (statusFilter === "Under Development" &&
        (p.status === "Under Development" || p.status === "DRAFT"));
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingProduct({
      name: "",
      slug: "",
      tagline: "",
      badge: "Enterprise Platform",
      shortDescription: "",
      fullDescription: "",
      coverImage: "/images/products/fms-cover.jpg",
      technologies: ["React", "Node.js", "PostgreSQL", "Docker"],
      benefits: [
        "High availability architecture",
        "Automated workflows",
        "Multi-tenant administration",
      ],
      status: "Live",
      order: products.length + 1,
      ctaText: "Explore Platform",
      ctaLink: "/request-for-quote",
      isFeatured: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: CmsProduct) => {
    setEditingProduct({ ...prod });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      window.confirm(
        `Are you sure you want to remove "${name}" from the product catalog?`,
      )
    ) {
      try {
        await deleteProduct(id);
        setNotification(`Product "${name}" deleted.`);
        setTimeout(() => setNotification(null), 3000);
      } catch (err: any) {
        alert(`Failed to delete: ${err.message}`);
      }
    }
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.slug) {
      alert("Product name and slug are required.");
      return;
    }

    setIsSaving(true);
    try {
      await saveProduct(editingProduct);
      setIsModalOpen(false);
      setEditingProduct(null);
      setNotification(`Product "${editingProduct.name}" saved successfully!`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "100%",
        margin: "0 auto",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        padding: "0",
        overflowX: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "clamp(1rem, 2vw, 2rem)",
          padding: "clamp(0.5rem, 1vw, 0)",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "#0F172A",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <ShoppingBag color="#18181B" /> Software Platforms & Products
            Catalog
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#64748B",
              marginTop: "0.375rem",
            }}
          >
            Manage pre-engineered enterprise software platforms, descriptions,
            technical capabilities, and direct quote CTAs.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.25rem",
            backgroundColor: "#18181B",
            border: "1px solid #09090B",
            borderRadius: "8px",
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: "0.875rem",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(24, 24, 27, 0.22)",
          }}
        >
          <Plus size={18} /> Add New Product
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.25rem",
            backgroundColor: "#ECFDF5",
            border: "1px solid #A7F3D0",
            borderRadius: "8px",
            color: "#047857",
            marginBottom: "1.5rem",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={16} /> {notification}
        </div>
      )}

      {/* Controls Bar: Search & Status Filters */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          backgroundColor: "#FFFFFF",
          padding: "1rem 1.25rem",
          borderRadius: "12px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flex: 1,
            minWidth: "240px",
          }}
        >
          <Search size={18} color="#64748B" />
          <input
            type="text"
            placeholder="Search by product name, slug, or tagline..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              backgroundColor: "transparent",
              border: "none",
              color: "#0F172A",
              fontSize: "0.875rem",
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          {(["ALL", "Live", "Under Development"] as const).map((st) => {
            const isSelected = statusFilter === st;
            let activeBg = "#EEF2FF";
            let activeColor = "#4338CA";
            let activeBorder = "#C7D2FE";
            if (st === "Live") {
              activeBg = "#ECFDF5";
              activeColor = "#047857";
              activeBorder = "#A7F3D0";
            } else if (st === "Under Development") {
              activeBg = "#FEF3C7";
              activeColor = "#B45309";
              activeBorder = "#FDE68A";
            }
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: "0.375rem 0.75rem",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  border: isSelected
                    ? `1px solid ${activeBorder}`
                    : "1px solid #E2E8F0",
                  backgroundColor: isSelected ? activeBg : "#FFFFFF",
                  color: isSelected ? activeColor : "#64748B",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {st}
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(min(100%, 340px), 1fr))",
          gap: "1.5rem",
        }}
      >
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
              transition: "all 0.2s ease",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.75rem",
                }}
              >
                {/* <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: '#EEF2FF', color: '#4338CA', border: '1px solid #C7D2FE' }}>
                  {prod.badge || 'Platform'}
                </span> */}
                <ProductStatusBadge
                  status={prod.status}
                  size="sm"
                  className="ml-auto"
                />{" "}
              </div>

              <h3
                style={{
                  fontSize: "1.1875rem",
                  fontWeight: 800,
                  color: "#0F172A",
                  margin: "0 0 0.375rem",
                }}
              >
                {prod.name}
              </h3>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#64748B",
                  marginBottom: "0.75rem",
                  fontFamily: "monospace",
                }}
              >
                /products/{prod.slug}
              </div>

              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "#475569",
                  margin: "0 0 1rem",
                  lineHeight: 1.5,
                }}
              >
                {prod.shortDescription || prod.tagline}
              </p>

              {/* Technologies Tags */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.375rem",
                  marginBottom: "1.25rem",
                }}
              >
                {(prod.technologies || []).map((t, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: "0.6875rem",
                      padding: "0.15rem 0.4rem",
                      borderRadius: "4px",
                      backgroundColor: "#F1F5F9",
                      color: "#334155",
                      border: "1px solid #E2E8F0",
                      fontWeight: 500,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: "1px solid #F1F5F9",
                paddingTop: "1rem",
              }}
            >
              <a
                href={`/products/${prod.slug}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: "0.75rem",
                  color: "#18181B",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  fontWeight: 600,
                }}
              >
                View on site <ExternalLink size={12} />
              </a>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => handleOpenEdit(prod)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    padding: "0.4rem 0.75rem",
                    borderRadius: "6px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    color: "#334155",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Edit2 size={13} color="#18181B" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(prod.id, prod.name)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0.4rem 0.6rem",
                    borderRadius: "6px",
                    backgroundColor: "#FFE4E6",
                    border: "1px solid #FECDD3",
                    color: "#BE123C",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                  }}
                  title="Delete product"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && editingProduct && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "750px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "2rem",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  color: "#0F172A",
                  margin: 0,
                }}
              >
                {editingProduct.id
                  ? `Edit Platform: ${editingProduct.name}`
                  : "Create New Platform"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#64748B",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSaveSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: "0.375rem",
                    }}
                  >
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        name: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      borderRadius: "6px",
                      padding: "0.625rem",
                      color: "#0F172A",
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: "0.375rem",
                    }}
                  >
                    URL Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.slug || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                      })
                    }
                    style={{
                      width: "100%",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      borderRadius: "6px",
                      padding: "0.625rem",
                      color: "#0F172A",
                      fontFamily: "monospace",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "0.375rem",
                  }}
                >
                  Tagline
                </label>
                <input
                  type="text"
                  value={editingProduct.tagline || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      tagline: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "6px",
                    padding: "0.625rem",
                    color: "#0F172A",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "0.375rem",
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "#334155",
                      margin: 0,
                    }}
                  >
                    Product Status
                  </label>
                  <ProductStatusBadge
                    status={editingProduct.status || "Live"}
                    size="sm"
                  />
                </div>
                <select
                  value={
                    editingProduct.status === "Under Development" ||
                    editingProduct.status === "DRAFT"
                      ? "Under Development"
                      : "Live"
                  }
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      status: e.target.value as any,
                    })
                  }
                  style={{
                    width: "100%",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "6px",
                    padding: "0.625rem",
                    color: "#0F172A",
                    outline: "none",
                    fontWeight: 600,
                  }}
                >
                  <option value="Live">Live</option>
                  <option value="Under Development">Under Development</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "0.375rem",
                  }}
                >
                  Short Summary
                </label>
                <textarea
                  rows={2}
                  value={editingProduct.shortDescription || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      shortDescription: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "6px",
                    padding: "0.625rem",
                    color: "#0F172A",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "0.375rem",
                  }}
                >
                  Full Technical Description
                </label>
                <textarea
                  rows={4}
                  value={editingProduct.fullDescription || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      fullDescription: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "6px",
                    padding: "0.625rem",
                    color: "#0F172A",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <ImageUpload
                  value={editingProduct.coverImage || ""}
                  onChange={(url) =>
                    setEditingProduct({ ...editingProduct, coverImage: url })
                  }
                  label="Product Platform Cover Image"
                  description="Upload platform screenshots, mockups, or diagrams (PNG, JPG, WebP, SVG)"
                  aspectRatioHint="Recommended: 16:9 banner"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: "0.375rem",
                    }}
                  >
                    Category
                  </label>
                  <input
                    type="text"
                    value={editingProduct.category || ""}
                    placeholder="e.g. Enterprise Solutions, HealthTech"
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        category: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      borderRadius: "6px",
                      padding: "0.625rem",
                      color: "#0F172A",
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: "0.375rem",
                    }}
                  >
                    Platform Icon
                  </label>
                  <select
                    value={editingProduct.iconName || "Activity"}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        iconName: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      borderRadius: "6px",
                      padding: "0.625rem",
                      color: "#0F172A",
                      outline: "none",
                    }}
                  >
                    <option value="Activity">Activity (Metrics / Core)</option>
                    <option value="ShoppingBag">ShoppingBag (Commerce)</option>
                    <option value="GraduationCap">GraduationCap (LMS / EdTech)</option>
                    <option value="HeartPulse">HeartPulse (Healthcare / HMS)</option>
                    <option value="Cpu">Cpu (System / Architecture)</option>
                    <option value="Layers">Layers (Platform)</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "0.375rem",
                  }}
                >
                  Technologies (comma-separated)
                </label>
                <input
                  type="text"
                  value={(editingProduct.technologies || []).join(", ")}
                  placeholder="e.g. React, Node.js, PostgreSQL, Docker, Kafka"
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      technologies: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                  style={{
                    width: "100%",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "6px",
                    padding: "0.625rem",
                    color: "#0F172A",
                    outline: "none",
                  }}
                />
              </div>

              {/* Architecture Design Targets (Tech Specs) */}
              <div
                style={{
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                  padding: "1rem",
                  backgroundColor: "#F8FAFC",
                }}
              >
                <h4
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    color: "#0F172A",
                    margin: "0 0 0.75rem",
                  }}
                >
                  Architecture Design Targets (Technical Specifications)
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.75rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "#475569",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Latency Design Target
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. < 45ms P99 API Latency"
                      value={editingProduct.techSpecs?.latency || ""}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          techSpecs: {
                            ...(editingProduct.techSpecs || {}),
                            latency: e.target.value,
                          },
                        })
                      }
                      style={{
                        width: "100%",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #CBD5E1",
                        borderRadius: "6px",
                        padding: "0.5rem",
                        fontSize: "0.8125rem",
                        color: "#0F172A",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "#475569",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Concurrency Design Target
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 50,000+ Concurrent Sessions"
                      value={editingProduct.techSpecs?.concurrency || ""}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          techSpecs: {
                            ...(editingProduct.techSpecs || {}),
                            concurrency: e.target.value,
                          },
                        })
                      }
                      style={{
                        width: "100%",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #CBD5E1",
                        borderRadius: "6px",
                        padding: "0.5rem",
                        fontSize: "0.8125rem",
                        color: "#0F172A",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.75rem",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "#475569",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Compliance Posture
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HIPAA Compliant Architecture & SOC 2"
                      value={editingProduct.techSpecs?.compliancePosture || ""}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          techSpecs: {
                            ...(editingProduct.techSpecs || {}),
                            compliancePosture: e.target.value,
                          },
                        })
                      }
                      style={{
                        width: "100%",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #CBD5E1",
                        borderRadius: "6px",
                        padding: "0.5rem",
                        fontSize: "0.8125rem",
                        color: "#0F172A",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "#475569",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Supported Protocols (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. GraphQL, gRPC, REST, WebSockets"
                      value={
                        Array.isArray(editingProduct.techSpecs?.protocols)
                          ? editingProduct.techSpecs!.protocols.join(", ")
                          : (editingProduct.techSpecs?.protocols as any) || ""
                      }
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          techSpecs: {
                            ...(editingProduct.techSpecs || {}),
                            protocols: e.target.value
                              .split(",")
                              .map((p) => p.trim())
                              .filter(Boolean),
                          },
                        })
                      }
                      style={{
                        width: "100%",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #CBD5E1",
                        borderRadius: "6px",
                        padding: "0.5rem",
                        fontSize: "0.8125rem",
                        color: "#0F172A",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Key Capabilities & Integration Features */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: "0.375rem",
                    }}
                  >
                    Key Capabilities (one per line)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter capability per line..."
                    value={(editingProduct.keyCapabilities || []).join("\n")}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        keyCapabilities: e.target.value
                          .split("\n")
                          .map((line) => line.trim())
                          .filter(Boolean),
                      })
                    }
                    style={{
                      width: "100%",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      borderRadius: "6px",
                      padding: "0.625rem",
                      fontSize: "0.8125rem",
                      color: "#0F172A",
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: "0.375rem",
                    }}
                  >
                    Integration Features (one per line)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter feature per line..."
                    value={(editingProduct.features || []).join("\n")}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        features: e.target.value
                          .split("\n")
                          .map((line) => line.trim())
                          .filter(Boolean),
                      })
                    }
                    style={{
                      width: "100%",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      borderRadius: "6px",
                      padding: "0.625rem",
                      fontSize: "0.8125rem",
                      color: "#0F172A",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: "0.375rem",
                    }}
                  >
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={editingProduct.ctaText || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        ctaText: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      borderRadius: "6px",
                      padding: "0.625rem",
                      color: "#0F172A",
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: "0.375rem",
                    }}
                  >
                    CTA Target Link
                  </label>
                  <input
                    type="text"
                    value={editingProduct.ctaLink || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        ctaLink: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      borderRadius: "6px",
                      padding: "0.625rem",
                      color: "#0F172A",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                  marginTop: "1rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: "0.625rem 1.25rem",
                    borderRadius: "6px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    color: "#475569",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    padding: "0.625rem 1.5rem",
                    borderRadius: "6px",
                    backgroundColor: "#18181B",
                    border: "1px solid #09090B",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    boxShadow: "0 2px 6px rgba(24, 24, 27, 0.22)",
                  }}
                >
                  <Save size={16} /> {isSaving ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

