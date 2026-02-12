/**
 * chartRegistration.js
 *
 * Registers ALL Chart.js components needed across every admin analytics section.
 * Import this file once at the top of any section that uses react-chartjs-2.
 *
 * Without registration, Bar / Doughnut / Pie / Radar charts render as blank boxes
 * and no error is shown — data fetches succeed but charts appear empty.
 */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,   // ← required for <Bar>
  ArcElement,   // ← required for <Doughnut> and <Pie>
  RadialLinearScale, // ← required for <Radar>
  Title,
  Tooltip,
  Legend,
  Filler        // ← required for fill: true on Line charts
);