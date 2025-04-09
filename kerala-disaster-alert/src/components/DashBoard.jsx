import './DashBoard.css';
import ChatBox from './ChatBox';
import React, { useState, useEffect, useRef } from 'react';
import MapComponent from './MapComponent';
import Papa from 'papaparse';

function DashBoard() {
    const [showChat, setShowChat] = useState(false);
    const [showTablePopup, setShowTablePopup] = useState(false);
    const [predictions, setPredictions] = useState({});
    const [boundaries, setBoundaries] = useState(null);
    const [csvData, setCsvData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileNameRef = useRef(null);

    const handleChatClick = () => setShowChat(true);
    const handleCloseChat = () => setShowChat(false);
    const handleOpenTablePopup = () => setShowTablePopup(true);
    const handleCloseTablePopup = () => setShowTablePopup(false);

    const showFileName = (event) => {
        const file = event.target.files[0];
        const fileName = file?.name || "No file chosen";
        if (fileNameRef.current) {
            fileNameRef.current.textContent = fileName;
        }

        if (file) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (result) => {
                    setCsvData(result.data);
                    handleOpenTablePopup();
                    sendCSVToBackend(result.data); // Send CSV data to the backend
                },
                error: (err) => {
                    console.error('Error parsing CSV:', err);
                },
            });
        }
    };
    const sendCSVToBackend = async (data) => {
    setIsLoading(true);
    try {
        const response = await fetch('/api/process_csv', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setPredictions(result.predictions);
    } catch (error) {
        console.error('Error sending CSV to backend:', error.message);
        alert(`Error: ${error.message}`); // Show error message to the user
    } finally {
        setIsLoading(false);
    }
};

    
    

    useEffect(() => {
        const fetchData = async () => {
            try {
                const boundaryData = await fetch('/api/boundaries').then((res) => res.json());
                setBoundaries(boundaryData);
            } catch (error) {
                console.error('Error fetching boundaries:', error);
            }
        };
        fetchData();
    }, []);
    return (
        <div>
            {/* Upload Section */}
            <div
                className="csv-upload"
                onClick={() => document.getElementById('csvFile').click()}
            >
                <label htmlFor="csvFile">Click here or drag and drop to upload a CSV file</label>
                <input
                    type="file"
                    id="csvFile"
                    accept=".csv"
                    onChange={showFileName}
                    style={{ display: 'none' }}
                />
                <span id="fileName" ref={fileNameRef}>
                    No file chosen
                </span>
            </div>

            {/* Map Component */}
            <div className={`map ${showChat ? 'blur-background' : ''}`}>
                <MapComponent predictions={predictions} boundaries={boundaries} />
            </div>

            {/* Loading Spinner */}
            {isLoading && <div className="loading-spinner">Loading predictions...</div>}

            {/* Chat Toggle Button */}
            <button className="dash-button" onClick={handleChatClick}>
                <div className="pyramid-loader">
                    <div className="wrapper">
                        <span className="side side1"></span>
                        <span className="side side2"></span>
                        <span className="side side3"></span>
                        <span className="side side4"></span>
                        <span className="shadow"></span>
                    </div>
                </div>
            </button>

            {/* ChatBox - Conditionally Rendered */}
            {showChat && (
                <div className="card">
                    <button className="close-button" onClick={handleCloseChat}>
                        &times;
                    </button>
                    <ChatBox />
                </div>
            )}

            {/* CSV Table Popup */}
            {showTablePopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <button className="popup-close" onClick={handleCloseTablePopup}>
                            &times;
                        </button>
                        <h3>Uploaded CSV Data</h3>
                        {csvData ? (
                            <table className="csv-table">
                                <thead>
                                    <tr>
                                        {Object.keys(csvData[0]).map((header, index) => (
                                            <th key={index}>{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {csvData.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {Object.values(row).map((value, cellIndex) => (
                                                <td key={cellIndex}>{value}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No data available</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashBoard;
