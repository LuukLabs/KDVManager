import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import { Email as EmailIcon } from "@mui/icons-material";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { executeFetch } from "@api/mutator/executeFetch";

type NewsletterRecipientVM = {
  guardianId: string;
  fullName: string;
  email: string;
};

type NewsletterRecipientsResponse = {
  year: number;
  month: number;
  generatedAt: string;
  totalActiveChildren: number;
  recipients: NewsletterRecipientVM[];
};

const useGetNewsletterRecipients = (
  params: { year: number; month: number },
  options?: { query?: { staleTime?: number; enabled?: boolean } },
) => {
  return useQuery<NewsletterRecipientsResponse>({
    queryKey: ["/crm/v1/children/newsletter-recipients", params],
    queryFn: ({ signal }) =>
      executeFetch<NewsletterRecipientsResponse>({
        url: `/crm/v1/children/newsletter-recipients`,
        method: "GET",
        params,
        signal,
      }),
    staleTime: options?.query?.staleTime,
    enabled: options?.query?.enabled,
  });
};

const currentYear = dayjs().year();
const currentMonth = dayjs().month() + 1;
const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
const months = Array.from({ length: 12 }, (_, i) => i + 1);

const NewsletterPage = () => {
  const { t } = useTranslation();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [submitted, setSubmitted] = useState(false);

  const { data, isFetching } = useGetNewsletterRecipients(
    { year: selectedYear, month: selectedMonth },
    {
      query: {
        staleTime: 5 * 60 * 1000,
        enabled: submitted,
      },
    },
  );

  const handleGenerate = () => {
    setSubmitted(true);
  };

  const getMonthName = (month: number) => {
    return dayjs()
      .month(month - 1)
      .format("MMMM");
  };

  const handleOpenMailClient = () => {
    if (!data?.recipients.length) return;
    // eslint-disable-next-line i18next/no-literal-string
    const emails = data.recipients.map((r) => r.email).join(",");
    window.location.href = `mailto:?bcc=${encodeURIComponent(emails)}`;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          {t("Newsletter")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t(
            "Collect email addresses of guardians linked to active children for a specific month to send a newsletter.",
          )}
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel id="year-label">{t("Year")}</InputLabel>
            <Select
              labelId="year-label"
              value={selectedYear}
              label={t("Year")}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value));
                setSubmitted(false);
              }}
            >
              {years.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel id="month-label">{t("Month")}</InputLabel>
            <Select
              labelId="month-label"
              value={selectedMonth}
              label={t("Month")}
              onChange={(e) => {
                setSelectedMonth(Number(e.target.value));
                setSubmitted(false);
              }}
            >
              {months.map((m) => (
                <MenuItem key={m} value={m}>
                  {getMonthName(m)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={handleGenerate} disabled={isFetching}>
              {t("Generate")}
            </Button>
            {data && !isFetching && data.recipients.length > 0 && (
              <Button
                variant="outlined"
                startIcon={<EmailIcon />}
                onClick={handleOpenMailClient}
              >
                {t("Send Email")}
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      {isFetching && (
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "center", py: 4 }}
        >
          <CircularProgress size={24} />
          <Typography>{t("Loading...")}</Typography>
        </Box>
      )}

      {data && !isFetching && (
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">
              {getMonthName(data.month)} {data.year}
            </Typography>
            <Chip
              label={`${data.totalActiveChildren} ${t("active children")}`}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`${data.recipients.length} ${t("email addresses")}`}
              size="small"
              color="secondary"
              variant="outlined"
            />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("Generated on")}: {dayjs(data.generatedAt).format("DD-MM-YYYY HH:mm")}
          </Typography>

          {data.recipients.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              {t("No email addresses found for this period.")}
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t("Name")}</TableCell>
                    <TableCell>{t("Email")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.recipients.map((recipient) => (
                    <TableRow key={recipient.guardianId}>
                      <TableCell>{recipient.fullName}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <EmailIcon fontSize="small" color="action" />
                          {recipient.email}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}
    </Box>
  );
};

export const Component = NewsletterPage;
