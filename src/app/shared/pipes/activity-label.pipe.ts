import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({ name: 'activityLabel', pure: false })
export class ActivityLabelPipe implements PipeTransform {
  constructor(private readonly translate: TranslateService) {}

  transform(
    activity: { code?: string; name?: string; description?: string | null } | null | undefined,
    field: 'name' | 'description' = 'name',
  ): string {
    if (!activity) return '';

    const key = `ACTIVITIES.${activity.code}.${field.toUpperCase()}`;
    const translated = activity.code ? this.translate.instant(key) : key;
    const fallback = field === 'name' ? activity.name : activity.description;
    return translated !== key ? translated : fallback || '';
  }
}
