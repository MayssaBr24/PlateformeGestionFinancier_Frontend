import { useState, useEffect } from 'react';
import { Download, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const HistoriqueEtudiant = () => {
    const [paiements, setPaiements] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({
        key: 'date',
        direction: 'desc'
    });
    const [isLoading, setIsLoading] = useState(true);

    const moisFrancais = [
        { francais: 'Janvier', backendKey: 'JANVIER' },
        { francais: 'Février', backendKey: 'FEVRIER' },
        { francais: 'Mars', backendKey: 'MARS' },
        { francais: 'Avril', backendKey: 'AVRIL' },
        { francais: 'Mai', backendKey: 'MAI' },
        { francais: 'Juin', backendKey: 'JUIN' },
        { francais: 'Juillet', backendKey: 'JUILLET' },
        { francais: 'Août', backendKey: 'AOUT' },
        { francais: 'Septembre', backendKey: 'SEPTEMBRE' },
        { francais: 'Octobre', backendKey: 'OCTOBRE' },
        { francais: 'Novembre', backendKey: 'NOVEMBRE' },
        { francais: 'Décembre', backendKey: 'DECEMBRE' },
    ];

    useEffect(() => {
        const fetchPaiements = async () => {
            try {
                const response = await fetch('https://localhost/api/paiements/etudiants/all');
                if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

                const data = await response.json();
                console.log("✅ Données reçues du backend:", data);
                setPaiements(data);
                setIsLoading(false);


            } catch (error) {
                console.error('❌ Erreur de récupération:', error);
                setIsLoading(false);
            }
        };
        fetchPaiements();
    }, []);

    const requestSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const sortedPaiements = [...paiements].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const filteredPaiements = sortedPaiements.filter(paiement =>
        `${paiement.etudiantNom} ${paiement.etudiantPrenom} ${paiement.etudiantClasse} ${paiement.date}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    const generatePDF = () => {
        const doc = new jsPDF({ orientation: 'landscape' });

        doc.setFontSize(18);
        doc.setTextColor(0);
        doc.text('Historique des Paiements Étudiants', 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);

        autoTable(doc, {
            startY: 35,
            head: [['Classe', 'Étudiant', ...moisFrancais.map(m => m.francais), 'Total Payé']],
            body: paiements.map(p => [
                p.etudiantClasse,
                `${p.etudiantNom} ${p.etudiantPrenom}`,
                ...moisFrancais.map(({ backendKey }) => {
                    const montant = Number(p.paiementsParMois?.[backendKey] || 0);
                    return `${montant.toFixed(2)} DT`;

                }),
                `${p.totalPaye.toFixed(2)} DT`
            ]),
            theme: 'grid',
            headStyles: {
                fillColor: [200, 200, 200],
                textColor: 0,
                fontSize: 9
            },
            styles: {
                fontSize: 8,
                cellPadding: 3,
                textColor: 0
            }
        });

        doc.save('historique_paiements_etudiants.pdf');
    };

    if (isLoading) return <div>Chargement...</div>;

    return (
        <div className="m-0">
            <div className="flex justify-between items-center mb-6">


                <button
                    onClick={generatePDF}
                    className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                    <Download className="mr-2" size={18} />
                    Générer PDF
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th
                                className="px-6 py-3 cursor-pointer"
                                onClick={() => requestSort('etudiantClasse')}
                            >
                                Classe
                                {sortConfig.key === 'etudiantClasse' && (
                                    sortConfig.direction === 'asc'
                                        ? <ChevronUp size={14} />
                                        : <ChevronDown size={14} />
                                )}
                            </th>
                            <th
                                className="px-6 py-3 cursor-pointer"
                                onClick={() => requestSort('etudiantNom')}
                            >
                                Étudiant
                                {sortConfig.key === 'etudiantNom' && (
                                    sortConfig.direction === 'asc'
                                        ? <ChevronUp size={14} />
                                        : <ChevronDown size={14} />
                                )}
                            </th>
                            {moisFrancais.map(({ francais }) => (
                                <th key={francais} className="px-6 py-3">
                                    {francais}
                                </th>
                            ))}
                            <th className="px-6 py-3">Total Payé</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {sortedPaiements.map((p) => (
                            <tr key={`${p.etudiantId}-${p.numInscription}`}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {p.etudiantClasse}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {p.etudiantNom} {p.etudiantPrenom}
                                    <br />
                                    <span className="text-sm text-gray-500">
                                            {p.numInscription}
                                        </span>
                                </td>
                                {moisFrancais.map(({ backendKey }) => (
                                    <td key={backendKey} className="px-6 py-4 whitespace-nowrap">
                                        {(Number(p.paiementsParMois?.[backendKey] || 0).toFixed(2))} DT
                                    </td>
                                ))}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {Number(p.totalPaye || 0).toFixed(2)} DT
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

export default HistoriqueEtudiant;
