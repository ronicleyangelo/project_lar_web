import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'app-score-gauge',
  templateUrl: './score-gauge.component.html',
  styleUrls: ['./score-gauge.component.css']
})
export class ScoreGaugeComponent implements OnChanges {
  @Input() score: number = 0;
  @Input() size: string = '110px';

  chartOptions: EChartsOption = {};

  ngOnChanges(changes: SimpleChanges): void {
    this.buildChart();
  }

  private buildChart(): void {
    const clamped = Math.max(0, Math.min(100, this.score));

    this.chartOptions = {
      series: [
        // Outer colored arc (background track with grade segments)
        {
          type: 'gauge',
          center: ['50%', '65%'],
          startAngle: 200,
          endAngle: -20,
          min: 0,
          max: 100,
          splitNumber: 10,
          itemStyle: {
            color: '#3c6b57'
          },
          progress: {
            show: true,
            width: 6,
            roundCap: true,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 1, y2: 0,
                colorStops: [
                  { offset: 0, color: '#c43d3d' },
                  { offset: 0.35, color: '#d3922e' },
                  { offset: 0.65, color: '#1a9bac' },
                  { offset: 1, color: '#3c6b57' }
                ]
              }
            }
          },
          pointer: {
            icon: 'triangle',
            length: '45%',
            width: 6,
            offsetCenter: [0, '-18%'],
            itemStyle: {
              color: '#1a9bac'
            }
          },
          axisLine: {
            lineStyle: {
              width: 6,
              color: [
                [0.25, '#c43d3d'],
                [0.50, '#d3922e'],
                [0.75, '#1a9bac'],
                [1, '#3c6b57']
              ]
            }
          },
          axisTick: {
            distance: -12,
            splitNumber: 3,
            lineStyle: {
              width: 1,
              color: 'auto'
            }
          },
          splitLine: {
            distance: -14,
            length: 6,
            lineStyle: {
              width: 2,
              color: 'auto'
            }
          },
          axisLabel: {
            show: false
          },
          anchor: {
            show: false
          },
          title: {
            show: true,
            offsetCenter: [0, '40%'],
            fontSize: 9,
            fontWeight: 600,
            color: '#778078'
          },
          detail: {
            valueAnimation: true,
            fontSize: 20,
            fontWeight: 850,
            offsetCenter: [0, '10%'],
            formatter: '{value}',
            color: 'auto'
          },
          data: [
            {
              value: clamped,
              name: 'Match Score'
            }
          ]
        },
        // Inner decorative ticks ring
        {
          type: 'gauge',
          center: ['50%', '65%'],
          startAngle: 200,
          endAngle: -20,
          min: 0,
          max: 100,
          itemStyle: {
            color: '#3c6b57'
          },
          progress: {
            show: false
          },
          pointer: {
            show: false
          },
          axisLine: {
            show: false
          },
          axisTick: {
            distance: -2,
            splitNumber: 5,
            lineStyle: {
              width: 1,
              color: '#778078',
              opacity: 0.3
            }
          },
          splitLine: {
            show: false
          },
          axisLabel: {
            show: true,
            distance: -12,
            fontSize: 7,
            fontWeight: 600,
            color: '#778078',
            formatter: (value: number) => {
              if (value === 0) return 'D';
              if (value === 25) return '';
              if (value === 50) return 'C';
              if (value === 75) return 'B';
              if (value === 100) return 'A';
              return '';
            }
          }
        }
      ]
    };
  }
}
