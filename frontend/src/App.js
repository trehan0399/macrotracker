import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ManualEntryForm from './components/ManualEntryForm';
import Chatbot from './components/Chatbot';
import NutritionChart from './components/NutritionChart';
import FoodLogs from './components/FoodLogs';
import Settings from './components/Settings';

function App() {
  const [foodLogs, setFoodLogs] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [maintenanceCalories, setMaintenanceCalories] = useState(2000);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [logsResponse, settingsResponse] = await Promise.all([
        axios.get('/api/logs'),
        axios.get('/api/settings/maintenance-calories')
      ]);
      setFoodLogs(logsResponse.data);
      setMaintenanceCalories(settingsResponse.data.maintenance_calories);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyStats = async () => {
    try {
      const response = await axios.get('/api/stats/weekly');
      setWeeklyStats(response.data);
    } catch (error) {
    }
  };

  const handleAddLog = async (logData) => {
    try {
      const response = await axios.post('/api/logs', logData);
      await fetchData();
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteLog = async (logId) => {
    try {
      await axios.delete(`/api/logs/${logId}`);
      await fetchData();
    } catch (error) {
    }
  };

  const handleClearAllLogs = async () => {
    try {
      await axios.delete('/api/logs');
      await fetchData();
    } catch (error) {
    }
  };

  const handleChatResponse = async (message) => {
    try {
      const response = await axios.post('/api/chat', { message });
      const logsResponse = await axios.get('/api/logs');
      setFoodLogs(logsResponse.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateMaintenanceCalories = async (calories) => {
    try {
      await axios.post('/api/settings/maintenance-calories', { maintenance_calories: calories });
      setMaintenanceCalories(calories);
    } catch (error) {
    }
  };

  const handleGenerateChart = async () => {
    await fetchWeeklyStats();
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'manual', name: 'Manual Entry', icon: '✏️' },
    { id: 'chatbot', name: 'AI Chatbot', icon: '🤖' },
    { id: 'chart', name: 'Weekly Chart', icon: '📈' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Macro Tracker</h1>
            <div className="text-sm text-gray-500">
              Track your nutrition with AI
            </div>
          </div>
        </div>
      </header>
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Add</h3>
                <ManualEntryForm onAddLog={handleAddLog} />
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Chatbot</h3>
                <Chatbot onChatResponse={handleChatResponse} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Food Logs</h2>
              <FoodLogs 
                logs={foodLogs} 
                onDeleteLog={handleDeleteLog}
                onClearAllLogs={handleClearAllLogs}
              />
            </div>
          </div>
        )}
        {activeTab === 'manual' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Manual Food Entry</h2>
            <ManualEntryForm onAddLog={handleAddLog} />
          </div>
        )}
        {activeTab === 'chatbot' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">AI Food Assistant</h2>
            <Chatbot onChatResponse={handleChatResponse} />
          </div>
        )}
        {activeTab === 'chart' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Weekly Calorie Chart</h2>
            <NutritionChart 
              data={weeklyStats}
              maintenanceCalories={maintenanceCalories}
              onGenerateChart={handleGenerateChart}
            />
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Settings</h2>
            <Settings 
              maintenanceCalories={maintenanceCalories}
              onUpdateMaintenanceCalories={handleUpdateMaintenanceCalories}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App; 