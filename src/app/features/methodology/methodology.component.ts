import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BadgeComponent } from '../../shared/atoms/badge/badge.component';

interface StyleCriteria {
  style: 'Completionist' | 'Speedrunner' | 'Manipulator' | 'Balanced';
  emoji: string;
  variant: 'success' | 'info' | 'danger' | 'warning';
  description: string;
  primarySignal: string;
  thresholds: Array<{ metric: string; condition: string; weight: string }>;
  typicalProfile: { rep: string; notebook: string; hidden: string; speed: string };
  ibmNote: string;
}

interface MetricDef {
  id: string;
  name: string;
  unit: string;
  description: string;
  derivedFrom: string;
  ibmConcept: string;
  range: string;
}

@Component({
  selector: 'df-methodology',
  standalone: true,
  imports: [RouterLink, BadgeComponent],
  templateUrl: './methodology.component.html',
  styleUrls: ['./methodology.component.scss']
})
export class MethodologyComponent {

  readonly metrics: MetricDef[] = [
    {
      id: 'reputation',
      name: 'Reputation',
      unit: '0–100',
      description: 'Puntuación global del detective basada en precisión de informes, gestión de información sensible y relaciones con testigos.',
      derivedFrom: 'accuracy + discretion + relationships (ponderados 40/30/30)',
      ibmConcept: 'Composite feature engineering',
      range: 'Media: ~72 · σ: ~12 · Mín observado: 46 · Máx: 95'
    },
    {
      id: 'hidden_rate',
      name: 'Hidden Decision Rate',
      unit: '0.0–1.0',
      description: 'Proporción de información sensible que el jugador eligió ocultar en sus informes. Valor alto indica estilo manipulador; valor bajo, transparencia.',
      derivedFrom: 'decisiones_ocultas / total_decisiones',
      ibmConcept: 'Feature ratio / normalization',
      range: 'Media: ~0.46 · Rango: 0.10–0.90'
    },
    {
      id: 'notebook_avg',
      name: 'Notebook Completion %',
      unit: '%',
      description: 'Porcentaje medio de páginas del cuaderno desbloqueadas por caso. Incluye personajes, pistas y expediente del caso. Indicador de exhaustividad investigadora.',
      derivedFrom: '(chars_pct × 0.5) + (clues_pct × 0.3) + (casefile_pct × 0.2)',
      ibmConcept: 'Weighted composite score',
      range: 'Media: ~80% · σ: ~10 · Outliers: <60%'
    },
    {
      id: 'session_efficiency',
      name: 'Session Efficiency',
      unit: '0–100',
      description: 'Velocidad relativa del jugador comparada con la media. Combina duración de sesión y casos completados. Alto = resolución rápida.',
      derivedFrom: '100 − (avg_session_s / 80) · normalizado al rango observado',
      ibmConcept: 'Derived efficiency metric',
      range: 'Rango efectivo: 10–99'
    },
    {
      id: 'lies_discovered',
      name: 'Lies Discovered',
      unit: 'count',
      description: 'Total de mentiras de sospechosos descubiertas en todos los casos. Indicador de profundidad de interrogatorio. Correlaciona con el final obtenido (r=0.60).',
      derivedFrom: 'sum(liesDiscovered) across all cases',
      ibmConcept: 'Cumulative count feature',
      range: 'Media: ~12 · Máx posible: 18'
    },
    {
      id: 'percentile',
      name: 'Percentile Rank',
      unit: '%',
      description: 'Posición del jugador dentro de la población total para cada métrica. P90 significa que el jugador supera al 90% de los demás. Calculado empíricamente.',
      derivedFrom: 'rank(value, population) / n × 100',
      ibmConcept: 'Percentile ranking (IBM DS Module 3)',
      range: 'Por definición: 0–100'
    },
  ];

  readonly styles: StyleCriteria[] = [
    {
      style: 'Completionist',
      emoji: '📓',
      variant: 'success',
      description: 'Prioriza explorar todo el escenario y desbloquear el cuaderno al máximo. Sesiones largas, informes precisos.',
      primarySignal: 'notebookAvg ≥ 87% AND sessionDuration ≥ percentil 60',
      thresholds: [
        { metric: 'Notebook avg',      condition: '≥ 87%',      weight: 'Primario' },
        { metric: 'Session duration',  condition: '> 4500s avg', weight: 'Secundario' },
        { metric: 'Hidden rate',       condition: '< 0.5',       weight: 'Contextual' },
        { metric: 'Clues found %',     condition: '≥ 90%',       weight: 'Confirmatorio' },
      ],
      typicalProfile: { rep: '78–92', notebook: '88–97%', hidden: '0.2–0.45', speed: '35–65' },
      ibmNote: 'Clúster de alta completitud. Alta correlación notebook–accuracy (r=0.71).'
    },
    {
      style: 'Speedrunner',
      emoji: '⚡',
      variant: 'info',
      description: 'Resuelve los casos rápidamente con pocos recursos. Eficiencia alta, cuaderno parcial, pero informes frecuentemente correctos.',
      primarySignal: 'sessionEfficiency ≥ 85 AND murdererCorrectRate ≥ 80%',
      thresholds: [
        { metric: 'Session efficiency', condition: '≥ 85',       weight: 'Primario' },
        { metric: 'Murderer correct %', condition: '≥ 80%',      weight: 'Primario' },
        { metric: 'Notebook avg',       condition: '60–80%',      weight: 'Distintivo (bajo)' },
        { metric: 'Hidden rate',        condition: '< 0.3',       weight: 'Contextual' },
      ],
      typicalProfile: { rep: '70–90', notebook: '65–80%', hidden: '0.1–0.25', speed: '80–99' },
      ibmNote: 'Outlier positivo en eficiencia. z-score de duración < -1.2 típicamente.'
    },
    {
      style: 'Manipulator',
      emoji: '🤐',
      variant: 'danger',
      description: 'Oculta información sistemáticamente para construir relaciones o favores. Reputación general más baja, red de contactos más amplia.',
      primarySignal: 'hiddenDecisionRate ≥ 0.65',
      thresholds: [
        { metric: 'Hidden rate',       condition: '≥ 0.65',       weight: 'Primario (determinante)' },
        { metric: 'Reputation',        condition: '< media',       weight: 'Secundario' },
        { metric: 'Accuracy',          condition: 'variable',      weight: 'No determinante' },
        { metric: 'Carryover effects', condition: '> 2 positivos', weight: 'Confirmatorio' },
      ],
      typicalProfile: { rep: '48–70', notebook: '60–78%', hidden: '0.65–0.92', speed: '40–70' },
      ibmNote: 'Correlación negativa hidden_rate vs reputation (r≈−0.34). Detectar outliers: hidden > 0.85 → alerta.'
    },
    {
      style: 'Balanced',
      emoji: '⚖️',
      variant: 'warning',
      description: 'Perfil equilibrado sin señal dominante en ninguna métrica. El clúster residual: jugadores que no caen en ningún segmento extremo.',
      primarySignal: 'ninguna condición anterior se cumple',
      thresholds: [
        { metric: 'Hidden rate',        condition: '0.35–0.65',  weight: 'Rango medio' },
        { metric: 'Notebook avg',       condition: '72–87%',     weight: 'Rango medio' },
        { metric: 'Session efficiency', condition: '40–80',      weight: 'Rango medio' },
        { metric: 'Reputation',         condition: '60–82',      weight: 'Rango medio' },
      ],
      typicalProfile: { rep: '62–80', notebook: '73–86%', hidden: '0.35–0.60', speed: '45–75' },
      ibmNote: 'Clúster por defecto (catch-all). ~32% de la población en este dataset.'
    },
  ];

  readonly correlations = [
    { x: 'Hidden Decisions', y: 'Reputation',      r: -0.34, interpretation: 'Ocultar información reduce ligeramente la reputación general' },
    { x: 'Notebook %',       y: 'Accuracy',         r:  0.71, interpretation: 'Explorar más el caso correlaciona fuertemente con informes más precisos' },
    { x: 'Session duration', y: 'Notebook %',       r:  0.52, interpretation: 'Sesiones más largas permiten mayor completitud del cuaderno' },
    { x: 'Lies discovered',  y: 'Final grade',      r:  0.60, interpretation: 'Detectar más mentiras predice buenos finales con fuerza moderada' },
    { x: 'Clues found',      y: 'Correct report',   r:  0.47, interpretation: 'Encontrar más pistas ayuda a identificar correctamente al culpable' },
  ];

  getCorrelationColor(r: number): string {
    const abs = Math.abs(r);
    if (r < 0) return abs >= 0.5 ? 'var(--c-red-light)' : 'var(--c-red-dim)';
    return abs >= 0.7 ? 'var(--c-green-light)' : abs >= 0.4 ? 'var(--c-amber-light)' : 'var(--c-blue-light)';
  }

  getStrength(r: number): string {
    const abs = Math.abs(r);
    if (abs >= 0.7) return 'strong';
    if (abs >= 0.4) return 'moderate';
    return 'weak';
  }
}