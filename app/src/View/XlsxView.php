<?php
/**
 * CAPS - Compilazione Assistita Piani di Studio
 * Copyright (C) 2014 - 2020 E. Paolini, J. Notarstefano, L. Robol
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

use Cake\View\View;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Cake\I18n\FrozenTime;

class XlsxView extends View
{
    public function render(?string $template = null, $layout = null) : string {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $vars = $this->getConfig('serialize');
        if (! is_array($vars))
            $vars = [ $vars ];
            
        foreach ($vars as $var) {
            $data = $this->get($var);
            foreach ($data as $i => $rowdata) {
                $cells = [];

                foreach ($rowdata as $j => $celldata) {
                    if ($celldata instanceof FrozenTime) {
                        $excelDateValue = \PhpOffice\PhpSpreadsheet\Shared\Date::PHPToExcel( intval($celldata->toUnixString()) );
                        $sheet->setCellValueByColumnAndRow($j + 1, $i + 1, $excelDateValue);
                        $sheet->getStyleByColumnAndRow($j + 1, $i + 1)
                            ->getNumberFormat()
                            ->setFormatCode(
                                \PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_DATE_DATETIME
                            );
                    }
                    else {
                        $sheet->setCellValueByColumnAndRow($j + 1, $i + 1, $celldata);
                    }
                }
            }
        }

        $writer = new Xlsx($spreadsheet);
        $tmpfile = tempnam("/tmp", "xlsx-writer-");
        $writer->save($tmpfile);

        $res = file_get_contents($tmpfile);
        unlink($tmpfile);

        return $res;
    }
}