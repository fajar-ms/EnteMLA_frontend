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
                <div className="mla-profile-main">
                    <img
                        src={mla.photo}
                        alt={mla.name}
                        className="mla-photo"
                    />
                    <div className="mla-header-content">
                        <span className="mla-badge">{mla.party}</span>
                        <span className="mla-pretitle">Your MLA</span>
                        <h2 className="mla-name">{mla.name}</h2>
                        <p className="mla-constituency">Constituency: {mla.constituencyId}</p>
                    </div>
                </div>
            </div>

            <div className="mla-details">
                <div className="mla-info">
                    <span className="mla-label">Email Address</span>
                    <span className="mla-value">
                        <a href={`mailto:${mla.email}`}>{mla.email}</a>
                    </span>
                </div>

                <div className="mla-info">
                    <span className="mla-label">Phone Number</span>
                    <span className="mla-value">
                        <a href={`tel:${mla.phone}`}>{mla.phone}</a>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MyMlaCard;