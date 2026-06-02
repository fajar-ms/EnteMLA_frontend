import React, {
    useEffect,
    useState,
} from "react";

import "./MyMlaCard.css";

import axios from "axios";

const MyMlaCard = () => {

    const [mla, setMla] =
        useState(null);

    useEffect(() => {

        const fetchMla =
            async () => {

                try {

                    const token =
                        localStorage.getItem(
                            "token"
                        );

                    const res =
                        await axios.get(
                            `${import.meta.env.VITE_API_BASE_URL}/auth/my-mla`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`,
                                },
                            }
                        );

                    setMla(res.data);

                } catch (error) {

                    console.log(error);
                }
            };

        const role =
            localStorage.getItem("role");

        if (role === "citizen" || role === "employee") {
            fetchMla();
        }

    }, []);

    if (!mla) return null;

    return (
        <div className="mla-card">

            <div className="mla-header">

                <img
                    src={mla.photo}
                    alt={mla.name}
                    className="mla-photo"
                />

                <div className="mla-info">
                    <span className="mla-label">Party</span>
                    <span className="mla-value">{mla.party}</span>
                </div>

                <div className="mla-header-content">
                    <h2>Your MLA</h2>
                    <h3>{mla.name}</h3>
                    <p>{mla.constituencyId}</p>
                </div>

            </div>

            <div className="mla-details">

                <div className="mla-info">
                    <span className="mla-label">Email</span>
                    <span className="mla-value">{mla.email}</span>
                </div>

                <div className="mla-info">
                    <span className="mla-label">Phone</span>
                    <span className="mla-value">{mla.phone}</span>
                </div>

            </div>

        </div>
    );
};

export default MyMlaCard;