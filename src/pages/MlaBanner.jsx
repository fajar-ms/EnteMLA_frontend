import React, {
    useEffect,
    useState
} from "react";

import mlaAxiosInstance from "../sevices/axiosInstance";
import "../style/MlaBanner.css";
import { toast } from "react-toastify";



const MlaBanner = () => {

    const [banners, setBanners] = useState([]);
    const [imageFile, setImageFile] = useState(null);

    const [form, setForm] = useState({
        title: "",
        description: "",
        imageUrl: "",
        isActive: true,
    });

    const [editingId, setEditingId] =
        useState(null);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const res =
                await mlaAxiosInstance.get("/banner");

            setBanners(res.data);

        } catch (err) {
            console.log(err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();

            formData.append(
                "title",
                form.title
            );

            formData.append(
                "description",
                form.description
            );

            formData.append(
                "isActive",
                form.isActive
            );

            if (imageFile) {
                formData.append(
                    "image",
                    imageFile
                );
            }

            if (editingId) {

                await mlaAxiosInstance.put(
                    `/banner/${editingId}`,
                    formData,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data",
                        },
                    }
                );

                toast.success(
                    "Banner updated successfully"
                );

            } else {

                await mlaAxiosInstance.post(
                    "/banner",
                    formData,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data",
                        },
                    }
                );

                toast.success(
                    "Banner added successfully"
                );
            }

            setForm({
                title: "",
                description: "",
                imageUrl: "",
                isActive: true,
            });

            setImageFile(null);
            setEditingId(null);

            fetchBanners();

        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                "Something went wrong"
            );
        }
    };

    const handleEdit = (banner) => {

        setForm({
            title: banner.title,
            description: banner.description,
            imageUrl: banner.imageUrl,
            isActive: banner.isActive,
        });
        setImageFile(null);
        setEditingId(banner._id);
    };

    const handleDelete = async (id) => {

        if (
            !window.confirm(
                "Delete this banner?"
            )
        )
            return;

        try {

            await mlaAxiosInstance.delete(
                `/banner/${id}`
            );

            toast.success(
                "Banner deleted"
            );

            fetchBanners();

        } catch (err) {

            toast.error(
                "Delete failed"
            );
        }
    };

    return (
        <div className="admin-banner-page">


            <div className="admin-banner-content">
                {/* BACK BUTTON HEADER AREA */}
                <div className="admin-header-actions">
                    <button
                        type="button"
                        className="back-btn"
                        onClick={() => window.history.back()} // Or replace with your routing logic like navigate(-1)
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Back to Dashboard
                    </button>
                </div>
                {/* FORM CARD */}
                <div className="banner-card">
                    <h2 className="banner-title">
                        {editingId ? "Modify Banner Properties" : "Register New Banner"}
                    </h2>

                    <form onSubmit={handleSubmit} className="banner-form">
                        <div className="form-group">
                            <input
                                type="text"
                                name="title"
                                placeholder="Banner Title / Heading"
                                value={form.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setImageFile(e.target.files[0])
                                }
                            />
                        </div>

                        <div className="form-group full-width">
                            <textarea
                                name="description"
                                placeholder="Administrative Description / Subtext Copy"
                                value={form.description}
                                onChange={handleChange}
                                rows="3"
                            />
                        </div>

                        {(imageFile || form.imageUrl) && (
                            <div className="banner-preview">
                                <span className="preview-label">
                                    Preview:
                                </span>

                                <img
                                    src={
                                        imageFile
                                            ? URL.createObjectURL(imageFile)
                                            : form.imageUrl
                                    }
                                    alt="Preview"
                                />
                            </div>
                        )}

                        <button type="submit" className="submit-btn">
                            {editingId ? "Save Property Changes" : "Publish Banner Asset"}
                        </button>
                    </form>
                </div>

                {/* BANNERS DISPLAY TABLE */}
                <h2 className="table-title">Constituency Announcements</h2>

                <div className="table-wrapper">
                    <table className="banner-table">
                        <thead>
                            <tr>
                                <th style={{ width: "160px" }}>Asset</th>
                                <th>Heading Title</th>
                                <th>Editorial Description</th>
                                <th style={{ textAlign: "center", width: "150px" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {banners.map((banner) => (
                                <tr key={banner._id}>
                                    <td>
                                        <img
                                            className="banner-thumb"
                                            src={banner.imageUrl}
                                            alt={banner.title}
                                        />
                                    </td>
                                    <td className="text-bold">{banner.title}</td>
                                    <td className="text-muted">{banner.description || "—"}</td>
                                    <td>
                                        <div className="action-group">
                                            <button
                                                className="edit-btn"
                                                onClick={() => handleEdit(banner)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDelete(banner._id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MlaBanner;