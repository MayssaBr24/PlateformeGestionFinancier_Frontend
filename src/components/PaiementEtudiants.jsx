import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function PaiementEtudiant() {
    const { etudiantId } = useParams();

    const [data, setData] = useState({
        etudiant: null,
        paiements: [],
        total: 0,
        loading: true,
        error: null
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setData(prev => ({...prev, loading: true, error: null}));

                const [etudiantRes, paiementsRes] = await Promise.all([
                    axios.get(`https://localhost/api/Etudiant/Etudiant/${etudiantId}`),
                    axios.get(`https://localhost/api/paiements/Etudiant/${etudiantId}`)
                ]);

                const total = paiementsRes.data.reduce((sum, p) => sum + Number(p.montant), 0);

                setData({
                    etudiant: etudiantRes.data,
                    paiements: paiementsRes.data,
                    total,
                    loading: false,
                    error: null
                });

            } catch (error) {
                setData({
                    etudiant: null,
                    paiements: [],
                    total: 0,
                    loading: false,
                    error: error.response?.data?.message || "Erreur de chargement"
                });
            }
        };

        if (etudiantId) fetchData();
    }, [etudiantId]);

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('fr-FR');
    };

    if (data.loading) return <div>Chargement...</div>;
    if (data.error) return <div className="text-red-500">{data.error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">
                Paiements de {data.etudiant?.prenom} {data.etudiant?.nom}
            </h1>

            <div className="mb-6 p-4 bg-gray-100 rounded">
                <p className="font-semibold">Total payé: {data.total.toFixed(2)} </p>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead>
                    <tr className="bg-gray-200">
                        <th className="py-2 px-4">Date</th>
                        <th className="py-2 px-4">Montant</th>
                        <th className="py-2 px-4">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.paiements.map(p => (
                        <tr key={p.id} className="border-b">
                            <td className="py-2 px-4">{formatDate(p.date)}</td>
                            <td className="py-2 px-4">{Number(p.montant).toFixed(2)} </td>
                            <td className="py-2 px-4">
                                <button
                                    onClick={() => window.open(`/api/paiements/${p.id}/recu`, '_blank')}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    Reçu
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default PaiementEtudiant;