import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function Analytics() {
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(subMonths(new Date(), 2)), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [dateData, setDateData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('expenses');

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, activeTab]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const [summaryRes, categoryRes, dateRes] = await Promise.all([
        axios.get('/analytics/summary', { params: dateRange }),
        axios.get('/analytics/by-category', { 
          params: { ...dateRange, type: activeTab === 'expenses' ? 'expense' : 'income' }
        }),
        axios.get('/analytics/by-date', { 
          params: { ...dateRange, type: activeTab === 'expenses' ? 'expense' : 'income' }
        })
      ]);

      setSummary(summaryRes.data);
      setCategoryData(categoryRes.data);
      setDateData(dateRes.data);
      setError('');
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getChartColors = () => {
    return [
      '#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#ff9f40',
      '#4bc0c0', '#9966ff', '#c9cbcf', '#4bc0c0', '#ff6384'
    ];
  };

  const pieChartData = {
    labels: categoryData.map(item => item.category),
    datasets: [
      {
        data: categoryData.map(item => item.total),
        backgroundColor: getChartColors(),
        borderColor: getChartColors(),
        borderWidth: 1,
      },
    ],
  };

  const lineChartData = {
    labels: dateData.map(item => format(new Date(item.date), 'MMM dd')),
    datasets: [
      {
        label: activeTab === 'expenses' ? 'Expenses' : 'Income',
        data: dateData.map(item => item.total),
        borderColor: activeTab === 'expenses' ? '#dc3545' : '#28a745',
        backgroundColor: activeTab === 'expenses' ? 'rgba(220, 53, 69, 0.1)' : 'rgba(40, 167, 69, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const barChartData = {
    labels: categoryData.map(item => item.category),
    datasets: [
      {
        label: activeTab === 'expenses' ? 'Expenses' : 'Income',
        data: categoryData.map(item => item.total),
        backgroundColor: activeTab === 'expenses' ? 'rgba(220, 53, 69, 0.8)' : 'rgba(40, 167, 69, 0.8)',
        borderColor: activeTab === 'expenses' ? '#dc3545' : '#28a745',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${formatCurrency(context.parsed)}`;
          }
        }
      }
    },
  };

  if (loading) {
    return <LoadingMessage>Loading analytics...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  const hasData = categoryData.length > 0 || dateData.length > 0;

  return (
    <AnalyticsContainer>
      <Header>
        <Titlestyle>Analytics</Titlestyle>
        <DateRangeSelector>
          <Input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
          />
          <span>to</span>
          <Input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
          />
        </DateRangeSelector>
      </Header>

      <StatsGrid>
        <StatCard color="#28a745">
          <StatValue color="#28a745">
            {formatCurrency(summary?.income)}
          </StatValue>
          <StatLabel>Total Income</StatLabel>
        </StatCard>

        <StatCard color="#dc3545">
          <StatValue color="#dc3545">
            {formatCurrency(summary?.expenses)}
          </StatValue>
          <StatLabel>Total Expenses</StatLabel>
        </StatCard>

        <StatCard color={summary?.balance >= 0 ? "#28a745" : "#dc3545"}>
          <StatValue color={summary?.balance >= 0 ? "#28a745" : "#dc3545"}>
            {formatCurrency(summary?.balance)}
          </StatValue>
          <StatLabel>Net Balance</StatLabel>
        </StatCard>

        <StatCard color="#17a2b8">
          <StatValue color="#17a2b8">
            {summary?.incomeCount + summary?.expenseCount || 0}
          </StatValue>
          <StatLabel>Total Transactions</StatLabel>
        </StatCard>
      </StatsGrid>

      {!hasData ? (
        <EmptyState>
          No data available for the selected date range. Try selecting a different time period or add some transactions.
        </EmptyState>
      ) : (
        <>
          <TabContainer>
            <Tab
              active={activeTab === 'expenses'}
              onClick={() => setActiveTab('expenses')}
            >
              Expenses Analysis
            </Tab>
            <Tab
              active={activeTab === 'income'}
              onClick={() => setActiveTab('income')}
            >
              Income Analysis
            </Tab>
          </TabContainer>

          <ChartsGrid>
            <ChartContainer>
              <ChartTitle>
                {activeTab === 'expenses' ? 'Expenses' : 'Income'} Over Time
              </ChartTitle>
              {dateData.length > 0 ? (
                <Line data={lineChartData} options={chartOptions} />
              ) : (
                <EmptyState>No data available for the selected time period.</EmptyState>
              )}
            </ChartContainer>

            <ChartContainer>
              <ChartTitle>
                {activeTab === 'expenses' ? 'Expenses' : 'Income'} by Category
              </ChartTitle>
              {categoryData.length > 0 ? (
                <Pie data={pieChartData} options={pieChartOptions} />
              ) : (
                <EmptyState>No category data available.</EmptyState>
              )}
            </ChartContainer>
          </ChartsGrid>

          <ChartContainer>
            <ChartTitle>
              {activeTab === 'expenses' ? 'Expenses' : 'Income'} by Category (Bar Chart)
            </ChartTitle>
            {categoryData.length > 0 ? (
              <Bar data={barChartData} options={chartOptions} />
            ) : (
              <EmptyState>No category data available.</EmptyState>
            )}
          </ChartContainer>
        </>
      )}
    </AnalyticsContainer>
  );
}


const AnalyticsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.md};
`;

const Titlestyle = styled.h1`
  margin: 0;
  color: ${props => props.theme.colors.text};
  font-size: 2rem;
  font-weight: 600;
`;

const DateRangeSelector = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  align-items: center;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Input = styled.input`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius};
  font-size: 1rem;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${props => props.theme.spacing.xl};

  @media (min-width: ${props => props.theme.breakpoints.desktop}) {
    grid-template-columns: 2fr 1fr;
  }
`;

const ChartContainer = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.boxShadow};
`;

const ChartTitle = styled.h3`
  margin: 0 0 ${props => props.theme.spacing.lg} 0;
  color: ${props => props.theme.colors.text};
  font-size: 1.25rem;
  font-weight: 600;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.boxShadow};
  border-left: 4px solid ${props => props.color || props.theme.colors.primary};
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: bold;
  color: ${props => props.color || props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const StatLabel = styled.div`
  color: ${props => props.theme.colors.textMuted};
  font-size: 0.875rem;
  font-weight: 500;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.textMuted};
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.danger};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl * 2};
  color: ${props => props.theme.colors.textMuted};
`;

const TabContainer = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const Tab = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.textMuted};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

export default Analytics;