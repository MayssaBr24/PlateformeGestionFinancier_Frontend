import React from 'react';
import { CreditCard } from 'lucide-react';

const StudentList = ({ etudiants, onPaiementClick }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left">Nom</th>
                    <th className="px-6 py-3 text-left">Prénom</th>
                    <th className="px-6 py-3 text-left">Classe</th>
                    <th className="px-6 py-3 text-left">numeroInscrit</th>
                    {/* <th className="px-6 py-3 text-left">État financier</th> */}
                    <th className="px-6 py-3 text-left">Actions</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {etudiants.length > 0 ? (
                    etudiants.map((etudiant) => (
                        <tr key={etudiant.id}>
                            <td className="px-6 py-4">{etudiant.nom}</td>
                            <td className="px-6 py-4">{etudiant.prenom}</td>
                            <td className="px-6 py-4">{etudiant.classe}</td>
                            <td className="px-6 py-4">{etudiant.numInscription}</td>
                            {/* <td className="px-6 py-4">{etudiant.etatFinancier?.toFixed(2) ?? '0.00'}%</td> */}
                            <td className="px-6 py-4">
                                <button
                                    onClick={() => onPaiementClick(etudiant)}
                                    className="text-blue-600 hover:text-blue-800 flex items-center"
                                >
                                    <CreditCard className="mr-1" size={16} />
                                    Paiement
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                            Aucun étudiant trouvé
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default StudentList;