import React from 'react';
import { Container, Typography, Box, Paper, Grid } from '@mui/material';
import { AttendanceListGenerator } from '../features/reports/AttendanceListGenerator';
import { useTranslation } from 'react-i18next';

const ReportsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t("Reports")}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {t("Generate various reports for your KDV administration")}
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                {t("Attendance List")}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {t("Generate an attendance list for a specific group, month and day of the week")}
              </Typography>
              <AttendanceListGenerator />
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                {t("Other Reports")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("More reporting functions will be available soon")}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export { ReportsPage as Component };
export default ReportsPage;
