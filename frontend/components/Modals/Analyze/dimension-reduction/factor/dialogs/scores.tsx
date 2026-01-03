// import React, {useEffect, useState} from "react";
// import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
// import {Button} from "@/components/ui/button";
// import {Separator} from "@/components/ui/separator";
// import {
//     FactorScoresProps,
//     FactorScoresType,
// } from "@/components/Modals/Analyze/dimension-reduction/factor/types/factor";
// import {Checkbox} from "@/components/ui/checkbox";
// import {ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
// import {Label} from "@/components/ui/label";
// import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
// import {CheckedState} from "@radix-ui/react-checkbox";

// export const FactorScores = ({
//     isScoresOpen,
//     setIsScoresOpen,
//     updateFormData,
//     data,
// }: FactorScoresProps) => {
//     const [scoresState, setScoresState] = useState<FactorScoresType>({
//         ...data,
//     });
//     const [isContinueDisabled, setIsContinueDisabled] = useState(false);

//     useEffect(() => {
//         if (isScoresOpen) {
//             setScoresState({ ...data });
//         }
//     }, [isScoresOpen, data]);

//     const handleChange = (
//         field: keyof FactorScoresType,
//         value: CheckedState | null
//     ) => {
//         setScoresState((prevState) => ({
//             ...prevState,
//             [field]: value,
//         }));
//     };

//     const handleMethodGrp = (value: string) => {
//         setScoresState((prevState) => ({
//             ...prevState,
//             Regression: value === "Regression",
//             Bartlett: value === "Bartlett",
//             Anderson: value === "Anderson",
//         }));
//     };

//     const handleContinue = () => {
//         Object.entries(scoresState).forEach(([key, value]) => {
//             updateFormData(key as keyof FactorScoresType, value);
//         });
//         setIsScoresOpen(false);
//     };

//     return (
//         <>
//             {/* Scores Dialog */}
//             <Dialog open={isScoresOpen} onOpenChange={setIsScoresOpen}>
//                 <DialogContent className="sm:max-w-md">
//                     <DialogHeader>
//                         <DialogTitle>Factor Analysis: Scores</DialogTitle>
//                     </DialogHeader>
//                     <Separator />
//                     <div className="flex flex-col gap-2">
//                         <div className="flex items-center space-x-2">
//                             <Checkbox
//                                 id="SaveVar"
//                                 checked={scoresState.SaveVar}
//                                 onCheckedChange={(checked) =>
//                                     handleChange("SaveVar", checked)
//                                 }
//                             />
//                             <label
//                                 htmlFor="SaveVar"
//                                 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//                             >
//                                 Save as Variables
//                             </label>
//                         </div>
//                         <div className="pl-6">
//                             <ResizablePanelGroup
//                                 direction="vertical"
//                                 className="min-h-[100px] max-w-md rounded-lg border md:min-w-[200px]"
//                             >
//                                 <ResizablePanel defaultSize={100}>
//                                     <div className="flex flex-col gap-2 p-2">
//                                         <Label className="font-bold">
//                                             Method
//                                         </Label>
//                                         <RadioGroup
//                                             value={
//                                                 scoresState.Regression
//                                                     ? "Regression"
//                                                     : scoresState.Bartlett
//                                                     ? "Bartlett"
//                                                     : "Anderson"
//                                             }
//                                             disabled={!scoresState.SaveVar}
//                                             onValueChange={handleMethodGrp}
//                                         >
//                                             <div className="flex flex-col gap-2">
//                                                 <div className="flex items-center space-x-2">
//                                                     <RadioGroupItem
//                                                         value="Regression"
//                                                         id="Regression"
//                                                     />
//                                                     <Label htmlFor="Regression">
//                                                         Regression
//                                                     </Label>
//                                                 </div>
//                                                 <div className="flex items-center space-x-2">
//                                                     <RadioGroupItem
//                                                         value="Bartlett"
//                                                         id="Bartlett"
//                                                     />
//                                                     <Label htmlFor="Bartlett">
//                                                         Bartlett
//                                                     </Label>
//                                                 </div>
//                                                 <div className="flex items-center space-x-2">
//                                                     <RadioGroupItem
//                                                         value="Anderson"
//                                                         id="Anderson"
//                                                     />
//                                                     <Label htmlFor="Anderson">
//                                                         Anderson
//                                                     </Label>
//                                                 </div>
//                                             </div>
//                                         </RadioGroup>
//                                     </div>
//                                 </ResizablePanel>
//                             </ResizablePanelGroup>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                             <Checkbox
//                                 id="DisplayFactor"
//                                 checked={scoresState.DisplayFactor}
//                                 onCheckedChange={(checked) =>
//                                     handleChange("DisplayFactor", checked)
//                                 }
//                             />
//                             <label
//                                 htmlFor="DisplayFactor"
//                                 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//                             >
//                                 Save as Variables
//                             </label>
//                         </div>
//                     </div>
//                     <DialogFooter className="sm:justify-start">
//                         <Button
//                             disabled={isContinueDisabled}
//                             type="button"
//                             onClick={handleContinue}
//                         >
//                             Continue
//                         </Button>
//                         <Button
//                             type="button"
//                             variant="secondary"
//                             onClick={() => setIsScoresOpen(false)}
//                         >
//                             Cancel
//                         </Button>
//                         <Button type="button" variant="secondary">
//                             Help
//                         </Button>
//                     </DialogFooter>
//                 </DialogContent>
//             </Dialog>
//         </>
//     );
// };



"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { CheckedState } from "@radix-ui/react-checkbox";
import {
    FactorScoresProps,
    FactorScoresType,
} from "@/components/Modals/Analyze/dimension-reduction/factor/types/factor";

export const FactorScores = ({
    isScoresOpen,
    setIsScoresOpen,
    updateFormData,
    data,
}: FactorScoresProps) => {
    // State lokal untuk menangani perubahan form sebelum di-submit (Continue)
    const [scoresState, setScoresState] = useState<FactorScoresType>({
        ...data,
    });
    
    // Sinkronisasi state saat sidebar dibuka
    useEffect(() => {
        if (isScoresOpen) {
            setScoresState({ ...data });
        }
    }, [isScoresOpen, data]);

    const handleChange = (
        field: keyof FactorScoresType,
        value: CheckedState | null
    ) => {
        setScoresState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleMethodGrp = (value: string) => {
        setScoresState((prevState) => ({
            ...prevState,
            Regression: value === "Regression",
            Bartlett: value === "Bartlett",
            Anderson: value === "Anderson",
        }));
    };

    const handleContinue = () => {
        Object.entries(scoresState).forEach(([key, value]) => {
            updateFormData(key as keyof FactorScoresType, value);
        });
        setIsScoresOpen(false);
    };

    // Jika sidebar tidak aktif, jangan render apapun (agar tidak menumpuk)
    if (!isScoresOpen) return null;

    return (
        <div className="h-full flex flex-col bg-popover text-popover-foreground">
            {/* 1. Separator Pemisah dari Header Utama (yang ada di Parent) */}
            <Separator />

            {/* 2. Area Konten (Scrollable) */}
            <div className="flex-grow overflow-auto px-6 py-4">
                <div className="flex flex-col gap-4">
                    
                    {/* Checkbox: Save as variables */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="SaveVar"
                            checked={scoresState.SaveVar}
                            onCheckedChange={(checked) =>
                                handleChange("SaveVar", checked)
                            }
                        />
                        <Label
                            htmlFor="SaveVar"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Save as variables
                        </Label>
                    </div>

                    {/* Box Method: Dibuat menggunakan ResizablePanelGroup agar konsisten dengan style Descriptive */}
                    <div className="pl-6">
                        <ResizablePanelGroup
                            direction="vertical"
                            className="min-h-[160px] w-full rounded-lg border"
                        >
                            <ResizablePanel defaultSize={100}>
                                <div className="flex flex-col gap-3 p-4">
                                    <Label className="font-bold">Method</Label>
                                    
                                    <RadioGroup
                                        value={
                                            scoresState.Regression
                                                ? "Regression"
                                                : scoresState.Bartlett
                                                ? "Bartlett"
                                                : "Anderson"
                                        }
                                        disabled={!scoresState.SaveVar}
                                        onValueChange={handleMethodGrp}
                                        className="flex flex-col gap-2"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="Regression"
                                                id="Regression"
                                            />
                                            <Label htmlFor="Regression" className="font-normal">
                                                Regression
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="Bartlett"
                                                id="Bartlett"
                                            />
                                            <Label htmlFor="Bartlett" className="font-normal">
                                                Bartlett
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="Anderson"
                                                id="Anderson"
                                            />
                                            <Label htmlFor="Anderson" className="font-normal">
                                                Anderson
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </div>

                    {/* Checkbox: Display factor score */}
                    <div className="flex items-center space-x-2 mt-2">
                        <Checkbox
                            id="DisplayFactor"
                            checked={scoresState.DisplayFactor}
                            onCheckedChange={(checked) =>
                                handleChange("DisplayFactor", checked)
                            }
                        />
                        <Label
                            htmlFor="DisplayFactor"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Display factor score coefficient matrix
                        </Label>
                    </div>
                </div>
            </div>

            {/* 3. Footer (Fixed di bawah) */}
            <div className="border-t border-border px-6 py-4 flex gap-2 bg-popover">
                <Button onClick={handleContinue}>
                    Continue
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => setIsScoresOpen(false)}
                >
                    Cancel
                </Button>
                <Button variant="secondary">
                    Help
                </Button>
            </div>
        </div>
    );
};