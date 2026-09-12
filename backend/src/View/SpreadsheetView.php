<?php
/**
 * CAPS - Compilazione Assistita Piani di Studio
 * Copyright (C) 2014 - 2021 E. Paolini, J. Notarstefano, L. Robol
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * This program is based on the CakePHP framework, which is released under
 * the MIT license, and whose copyright is held by the Cake Software
 * Foundation. See https://cakephp.org/ for further details.
 */
namespace App\View;

use Cake\I18n\DateTime;
use Cake\View\View;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

abstract class SpreadsheetView extends View
{
    protected array $_defaultConfig = [
        'serialize' => null,
    ];

    /**
     * Convert the configured view variables into a spreadsheet.
     *
     * @param bool $excelDates Whether date values should use Excel date formatting.
     * @return \PhpOffice\PhpSpreadsheet\Spreadsheet
     */
    protected function renderSpreadsheet(bool $excelDates = true): Spreadsheet
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $vars = $this->getConfig('serialize');
        if ($vars === true) {
            $vars = array_keys($this->viewVars);
        } elseif (!is_array($vars)) {
            $vars = [$vars];
        }

        foreach ($vars as $var) {
            if (!is_string($var)) {
                continue;
            }
            $data = $this->get($var);
            foreach ($data as $i => $rowdata) {
                foreach ($rowdata as $j => $celldata) {
                    $coordinate = Coordinate::stringFromColumnIndex($j + 1) . ($i + 1);
                    if ($celldata instanceof DateTime && $excelDates) {
                        $excelDateValue = Date::PHPToExcel($celldata);
                        $sheet->setCellValue($coordinate, $excelDateValue);
                        $sheet->getStyle($coordinate)
                            ->getNumberFormat()
                            ->setFormatCode(NumberFormat::FORMAT_DATE_DATETIME);
                    } else {
                        $sheet->setCellValue($coordinate, $celldata);
                    }
                }
            }
        }

        return $spreadsheet;
    }
}
