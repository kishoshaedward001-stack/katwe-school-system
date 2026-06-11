import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const ProgressChart = ({ studentId, studentName }) => {
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = process.env.REACT_APP_API_URL || 'https://katwe-backend.onrender.com/api';

    useEffect(() => {
        fetchProgress();
    }, [studentId]);

    const fetchProgress = async () => {
        try {
            const response = await fetch(`${API_URL}/students/${studentId}/progress`);
            const data = await response.json();
            if (data.success) {
                setProgress(data.progress);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to load progress data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="progress-loading">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Inapakia maendeleo...</p>
            </div>
        );
    }

    if (error || !progress?.hasData) {
        return (
            <div className="progress-no-data">
                <i className="fas fa-chart-line"></i>
                <p>Bado hakuna matokeo ya kutosha kuonyesha maendeleo</p>
                <small>Matokeo ya angalau muhula mmoja yanahitajika</small>
            </div>
        );
    }

    const chartData = {
        labels: progress.labels,
        datasets: [
            {
                label: 'Average Score (%)',
                data: progress.averages,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.3,
                pointBackgroundColor: 'rgb(59, 130, 246)',
                pointBorderColor: 'white',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `Maendeleo ya ${studentName}`,
                font: { size: 16 }
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        let label = context.dataset.label || '';
                        if (label) label += ': ';
                        label += `${context.raw}%`;
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                min: 0,
                max: 100,
                title: {
                    display: true,
                    text: 'Average Score (%)'
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Exam Period'
                },
                grid: {
                    display: false
                }
            }
        }
    };

    const getTrendColor = () => {
        if (progress.trend === 'improving') return '#10b981';
        if (progress.trend === 'declining') return '#ef4444';
        return '#f59e0b';
    };

    const getTrendText = () => {
        if (progress.trend === 'improving') return 'Inaongezeka 📈';
        if (progress.trend === 'declining') return 'Inapungua 📉';
        return 'Imetulia 📊';
    };

    return (
        <div className="progress-container">
            <div className="progress-stats-grid">
                <div className="progress-stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                        <h4>Current Average</h4>
                        <p className="stat-value">{progress.currentAverage}%</p>
                    </div>
                </div>
                <div className="progress-stat-card">
                    <div className="stat-icon">🏆</div>
                    <div className="stat-info">
                        <h4>Current Division</h4>
                        <p className="stat-value">{progress.currentDivision}</p>
                    </div>
                </div>
                <div className="progress-stat-card">
                    <div className="stat-icon">📈</div>
                    <div className="stat-info">
                        <h4>Trend</h4>
                        <p className="stat-value" style={{ color: getTrendColor() }}>
                            {getTrendText()}
                        </p>
                    </div>
                </div>
                <div className="progress-stat-card">
                    <div className="stat-icon">📅</div>
                    <div className="stat-info">
                        <h4>Exams Taken</h4>
                        <p className="stat-value">{progress.totalExams}</p>
                    </div>
                </div>
            </div>

            <div className="progress-chart-container">
                <div className="chart-wrapper">
                    <Line data={chartData} options={options} />
                </div>
            </div>

            <div className="progress-summary">
                <h4>Muhtasari wa Maendeleo</h4>
                <div className="summary-items">
                    <div className="summary-item">
                        <span>Best Performance:</span>
                        <strong>{progress.bestAverage}%</strong>
                    </div>
                    <div className="summary-item">
                        <span>Improvement:</span>
                        <strong className={progress.improvement.startsWith('+') ? 'positive' : 'negative'}>
                            {progress.improvement}
                        </strong>
                    </div>
                    <div className="summary-item">
                        <span>Total Exams:</span>
                        <strong>{progress.totalExams}</strong>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressChart;