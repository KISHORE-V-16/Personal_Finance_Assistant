import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const currentMonth = {
        start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
      };

      const [summaryRes, transactionsRes] = await Promise.all([
        axios.get('/analytics/summary', {
          params: {
            startDate: currentMonth.start,
            endDate: currentMonth.end
          }
        }),
        axios.get('/transactions', {
          params: {
            limit: 5,
            page: 1
          }
        })
      ]);

      setSummary(summaryRes.data);
      setRecentTransactions(transactionsRes.data.transactions);
      setError('');
      
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
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

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  if (loading) {
    return <LoadingMessage>Loading dashboard...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <DashboardContainer>
      <StatsGrid>
        <StatCard color="#28a745">
          <StatValue color="#28a745">
            {formatCurrency(summary?.income)}
          </StatValue>
          <StatLabel>Monthly Income ({summary?.incomeCount} transactions)</StatLabel>
        </StatCard>

        <StatCard color="#dc3545">
          <StatValue color="#dc3545">
            {formatCurrency(summary?.expenses)}
          </StatValue>
          <StatLabel>Monthly Expenses ({summary?.expenseCount} transactions)</StatLabel>
        </StatCard>

        <StatCard color={summary?.balance >= 0 ? "#28a745" : "#dc3545"}>
          <StatValue color={summary?.balance >= 0 ? "#28a745" : "#dc3545"}>
            {formatCurrency(summary?.balance)}
          </StatValue>
          <StatLabel>Net Balance</StatLabel>
        </StatCard>
      </StatsGrid>

      <Section>
        <SectionTitle>Recent Transactions</SectionTitle>
        <TransactionList>
          {recentTransactions.length === 0 ? (
            <EmptyState>
              No transactions yet. Start by adding your first transaction!
            </EmptyState>
          ) : (
            recentTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} type={transaction.type}>
                <TransactionInfo>
                  <TransactionDescription>
                    {transaction.description || transaction.category}
                  </TransactionDescription>
                  <TransactionMeta>
                    {transaction.category} • {formatDate(transaction.date)}
                  </TransactionMeta>
                </TransactionInfo>
                <TransactionAmount type={transaction.type}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(Math.abs(transaction.amount))}
                </TransactionAmount>
              </TransactionItem>
            ))
          )}
        </TransactionList>
      </Section>
    </DashboardContainer>
  );
}

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.boxShadow};
  border-left: 4px solid ${props => props.color || props.theme.colors.primary};
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.color || props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const StatLabel = styled.div`
  color: ${props => props.theme.colors.textMuted};
  font-size: 0.875rem;
  font-weight: 500;
`;

const Section = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.boxShadow};
`;

const SectionTitle = styled.h2`
  margin: 0 0 ${props => props.theme.spacing.lg} 0;
  color: ${props => props.theme.colors.text};
  font-size: 1.25rem;
  font-weight: 600;
`;

const TransactionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const TransactionItem = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius};
  background: ${props => props.theme.colors.light};
  border-left: 3px solid ${props => props.type === 'income' ? props.theme.colors.success : props.theme.colors.danger};
`;

const TransactionInfo = styled.div`
  flex: 1;
`;

const TransactionDescription = styled.div`
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

const TransactionMeta = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textMuted};
  margin-top: ${props => props.theme.spacing.xs};
`;

const TransactionAmount = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
  color: ${props => props.type === 'income' ? props.theme.colors.success : props.theme.colors.danger};
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
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.textMuted};
`;

export default Dashboard;